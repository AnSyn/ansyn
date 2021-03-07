import { Actions, Effect, ofType } from '@ngrx/effects';
import { Inject, Injectable } from '@angular/core';
import { combineLatest, forkJoin, Observable, of, pipe } from 'rxjs';
import { Action, Store } from '@ngrx/store';
import {
	IMapState,
	IPendingOverlay,
	LayoutKey,
	layoutOptions,
	MapActionTypes,
	mapStateSelector,
	RemovePendingOverlayAction,
	selectActiveMapId,
	selectFooterCollapse, selectLayout,
	selectMaps,
	selectMapsList, SetFourViewsModeAction,
	SetLayoutAction,
	SetLayoutSuccessAction,
	SetPendingOverlaysAction, SetToastMessageAction, ToggleFooter
} from '@ansyn/map-facade';
import { IAppState } from '../app.effects.module';

import { getAngleDegreeBetweenPoints, IImageryMapPosition } from '@ansyn/imagery';
import {
	catchError,
	filter,
	map,
	mergeMap,
	switchMap,
	withLatestFrom,
	distinctUntilKeyChanged,
	distinctUntilChanged
} from 'rxjs/operators';
import { isEqual } from 'lodash';
import {
	DisplayFourViewsAction,
	DisplayMultipleOverlaysFromStoreAction,
	DisplayOverlayAction,
	DisplayOverlayFromStoreAction,
	DisplayOverlaySuccessAction,
	OverlaysActionTypes,
	SetHoveredOverlayAction,
	SetMarkUp, SetOverlaysCriteriaAction,
	SetTotalOverlaysAction,
	SetFourViewsOverlaysAction
} from '../../modules/overlays/actions/overlays.actions';
import {
	IMarkUpData,
	MarkUpClass,
	selectDropMarkup, selectOverlaysCriteria,
} from '../../modules/overlays/reducers/overlays.reducer';
import { ExtendMap } from '../../modules/overlays/reducers/extendedMap.class';
import { overlayOverviewComponentConstants } from '../../modules/overlays/components/overlay-overview/overlay-overview.component.const';
import { OverlaysService } from '../../modules/overlays/services/overlays.service';
import { CaseRegionState, ICaseMapState } from '../../modules/menu-items/cases/models/case.model';
import {
	IFourViewsConfig,
	fourViewsConfig,
	IOverlay,
	IOverlaysCriteria,
	IOverlaysFetchData, IFourViews
} from '../../modules/overlays/models/overlay.model';
import { Dictionary } from '@ngrx/entity';
import { SetBadgeAction } from '@ansyn/menu';
import { ComponentVisibilityService } from '../../app-providers/component-visibility.service';
import { ComponentVisibilityItems } from '../../app-providers/component-mode';
import { casesConfig } from '../../modules/menu-items/cases/services/cases.service';
import { ICasesConfig } from '../../modules/menu-items/cases/models/cases-config';
import { TranslateService } from '@ngx-translate/core';
import { MultipleOverlaysSourceProvider } from '../../modules/overlays/services/multiple-source-provider';
import { Point } from 'geojson';
import { IFetchParams } from '../../modules/overlays/models/base-overlay-source-provider.model';
import { feature } from '@turf/turf';
@Injectable()
export class OverlaysAppEffects {

	@Effect()
	displayMultipleOverlays$: Observable<any> = this.actions$.pipe(
		ofType(OverlaysActionTypes.DISPLAY_MULTIPLE_OVERLAYS_FROM_STORE),
		filter((action: DisplayMultipleOverlaysFromStoreAction) => action.payload.length > 0),
		withLatestFrom(this.store$.select(selectMapsList)),
		mergeMap(([action, mapsList]: [DisplayMultipleOverlaysFromStoreAction, ICaseMapState[]]): any => {
			const validPendingOverlays = action.payload;
			/* theoretical situation */
			if (validPendingOverlays.length <= mapsList.length) {
				return validPendingOverlays.map((pendingOverlay: IPendingOverlay, index: number) => {
					let { overlay, extent } = pendingOverlay;
					let mapId = mapsList[index].id;
					return new DisplayOverlayAction({ overlay, mapId, extent });
				});
			}

			const layout = Array.from(layoutOptions.keys()).find((key: LayoutKey) => {
				const layout = layoutOptions.get(key);
				return layout.mapsCount === validPendingOverlays.length;
			});
			return [new SetPendingOverlaysAction(validPendingOverlays), new SetLayoutAction(layout)];
		})
	);

	@Effect()
	displayPendingOverlaysOnChangeLayoutSuccess$: Observable<any> = this.actions$.pipe(
		ofType(MapActionTypes.SET_LAYOUT_SUCCESS),
		withLatestFrom(this.store$.select(mapStateSelector)),
		filter(([action, mapState]) => mapState.pendingOverlays.length > 0),
		mergeMap(([action, mapState]: [SetLayoutSuccessAction, IMapState]) => {
			const validPendingOverlays = mapState.pendingOverlays.filter(({ overlay }) => overlay);
			return validPendingOverlays.map((pendingOverlay: any, index: number) => {
				const { overlay, extent } = pendingOverlay;
				const mapId = Object.values(mapState.entities)[index].id;
				return new DisplayOverlayAction({ overlay, mapId, extent });
			});
		})
	);

	@Effect()
	removePendingOverlayOnDisplay$: Observable<any> = this.actions$.pipe(
		ofType(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS),
		withLatestFrom(this.store$.select(mapStateSelector)),
		filter(([action, mapState]: [DisplayOverlaySuccessAction, IMapState]) => mapState.pendingOverlays.some((pending) => pending.overlay?.id === action.payload.overlay.id)),
		map(([action, mapState]: [DisplayOverlaySuccessAction, IMapState]) => {
			return new RemovePendingOverlayAction(action.payload.overlay.id);
		})
	);

	@Effect()
	onDisplayOverlayFromStore$: Observable<any> = this.actions$.pipe(
		ofType(OverlaysActionTypes.DISPLAY_OVERLAY_FROM_STORE),
		withLatestFrom(this.overlaysService.getAllOverlays$, this.store$.select(selectActiveMapId), this.store$.select(selectLayout)),
		filter(([{ payload }, overlays, activeMapId, layout]: [DisplayOverlayFromStoreAction, Map<string, IOverlay>, string, string]) => overlays && overlays.has(payload.id)),
		mergeMap(([{ payload }, overlays, activeMapId, layout]: [DisplayOverlayFromStoreAction, Map<string, IOverlay>, string, string]) => {
			const mapId = payload.mapId || activeMapId;
			const overlay = overlays.get(payload.id);
			const actions: Action[] = [new DisplayOverlayAction({
				overlay,
				mapId,
				extent: payload.extent,
				customOriantation: payload.customOriantation
			})];

			const oneMapLayout = 'layout1';
			if (layout === oneMapLayout && this.componentVisibilityService.get(ComponentVisibilityItems.SCREENS)) {
				const twoMapsLayout = 'layout2';
				actions.push(new SetLayoutAction(twoMapsLayout));
			}

			return actions;
		})
	);

	@Effect()
	onDisplayFourViews$: Observable<any> = this.actions$.pipe(
		ofType(OverlaysActionTypes.DISPLAY_FOUR_VIEWS),
		withLatestFrom(this.store$.select(selectOverlaysCriteria)),
		mergeMap(([{ payload }, criteria]: [DisplayFourViewsAction, IOverlaysCriteria]) => {
			const observableOverlays: Observable<IOverlaysFetchData>[] = this.getFourViewsOverlays(payload, criteria);

			return forkJoin(observableOverlays).pipe(
				mergeMap((overlaysData: any[]) => {
					overlaysData = this.sortOverlaysByAngle(overlaysData, payload);
					const overlays: any[] = overlaysData.map(({data}) => ({ overlay: data[0]})).filter(({ overlay }) => overlay);

					if (overlays.length < 4) {
						let toastText = this.translateService.instant('Some angles are missing');
						if (!overlays.length) {
							toastText = this.translateService.instant('There are no overlays for the current Criteria');
						}

						return [new SetToastMessageAction(toastText)];
					}

					const [firstAngleOverlays, secondAngleOverlays, thirdAngleOverlays, fourthAngleOverlays] = overlays.map(({ data }) => data);
					const fourViewsOverlays: IFourViews = { firstAngleOverlays, secondAngleOverlays, thirdAngleOverlays, fourthAngleOverlays };
					const fourMapsLayout = 'layout6';

					return [
						new SetOverlaysCriteriaAction({ region: feature(payload) }),
						new SetLayoutAction(fourMapsLayout),
						new SetPendingOverlaysAction(overlays),
						new ToggleFooter(true),
						new SetFourViewsOverlaysAction(fourViewsOverlays),
						new SetFourViewsModeAction(true)
					];
				})
			)
		})
	);

	private getOverlayFromDropMarkup = map(([markupMap, overlays]: [ExtendMap<MarkUpClass, IMarkUpData>, Map<any, any>]) =>
		overlays.get(markupMap && markupMap.get(MarkUpClass.hover) && markupMap.get(MarkUpClass.hover).overlaysIds[0])
	);

	private getPositionForActiveMap = pipe(
		withLatestFrom(this.store$.select(selectActiveMapId)),
		withLatestFrom(this.store$.select(selectMaps)),
		filter(([[overlay, activeMapId], mapsList]: [[IOverlay, string], Dictionary<ICaseMapState>]) => Boolean(mapsList) && Boolean(mapsList[activeMapId])),
		map(([[overlay, activeMapId], mapsList]: [[IOverlay, string], Dictionary<ICaseMapState>]) => {
			const result = [overlay, mapsList[activeMapId].data.position];
			return result;
		})
	);

	private getOverlayWithNewThumbnail: any = switchMap(([overlay, position]: [IOverlay, IImageryMapPosition]) => {
		if (!overlay) {
			return [overlay];
		}
		this.store$.dispatch(new SetHoveredOverlayAction(<IOverlay>{
			...overlay,
			thumbnailUrl: overlayOverviewComponentConstants.FETCHING_OVERLAY_DATA
		}));
		return this.overlaysService.getThumbnailUrl(overlay, position).pipe(
			map(thumbnailUrl => ({
				...overlay,
				thumbnailUrl,
				thumbnailName: this.overlaysService.getThumbnailName(overlay)
			})),
			catchError(() => {
				return of(overlay);
			})
		);
	});

	private getHoveredOverlayAction = map((overlay: IOverlay) => {
		return new SetHoveredOverlayAction(overlay);
	});

	@Effect()
	setHoveredOverlay$: Observable<any> = combineLatest([this.store$.select(selectDropMarkup), this.store$.select(selectFooterCollapse)])
		.pipe(
			distinctUntilChanged(isEqual),
			withLatestFrom<any, any>(this.overlaysService.getAllOverlays$, ([drop, footer], overlays) => [drop, overlays]),
			this.getOverlayFromDropMarkup,
			this.getPositionForActiveMap,
			this.getOverlayWithNewThumbnail,
			this.getHoveredOverlayAction
		)
		.pipe(
			catchError(err => {
				console.error(err);
				return of(err);
			})
		);

	@Effect()
	activeMapLeave$ = this.actions$.pipe(
		ofType(MapActionTypes.TRIGGER.IMAGERY_MOUSE_LEAVE),
		map(() => new SetMarkUp({ classToSet: MarkUpClass.hover, dataToSet: { overlaysIds: [] } }))
	);

	@Effect()
	updateResultTableBadge$: Observable<SetBadgeAction> = this.actions$.pipe(
		ofType<SetTotalOverlaysAction>(OverlaysActionTypes.SET_TOTAL_OVERLAYS),
		distinctUntilKeyChanged('payload'),
		map((action) => new SetBadgeAction({ key: 'Results table', badge: `${ action.payload.number }` })));

	constructor(public actions$: Actions,
				public store$: Store<IAppState>,
				@Inject(fourViewsConfig) protected fourViewsConfig: IFourViewsConfig,
				@Inject(casesConfig) protected casesConfig: ICasesConfig,
				protected translateService: TranslateService,
				protected sourceProvicer: MultipleOverlaysSourceProvider,
				public overlaysService: OverlaysService,
				protected componentVisibilityService: ComponentVisibilityService) {
	}

	getFourViewsOverlays(region: Point, criteria: CaseRegionState) {
		const { registeration, resolution } = this.casesConfig.defaultCase.state.advancedSearchParameters;
		const searchParams: IFetchParams = {
			limit: this.fourViewsConfig.storageLimitPerAngle,
			sensors: this.fourViewsConfig.sensors,
			region,
			timeRange: {
				start: criteria.time.from,
				end: criteria.time.to
			},
			registeration,
			resolution,
			angleParams: {
				firstAngle: 0,
				secondAngle: 89
			}
		};

		const observableOverlays = [this.sourceProvicer.fetch(searchParams)];

		for (let i = 0; i < 4; i++) {
			searchParams.angleParams.firstAngle += 90;
			searchParams.angleParams.secondAngle += 90;
			observableOverlays.push(this.sourceProvicer.fetch(searchParams));
		}

		return observableOverlays;
	}

	sortOverlaysByAngle(overlaysData, point) {
		return overlaysData.sort((prev, next) => {
			if (!prev.data.length || !next.data.length) {
				return false;
			}

			const [prevOverlay] = prev.data;
			const [nextOverlay] = next.data;

			const prevOverlayAngle = getAngleDegreeBetweenPoints(prevOverlay.sensorLocation, point);
			const nextOverlayAngle = getAngleDegreeBetweenPoints(nextOverlay.sensorLocation, point);
			return prevOverlayAngle - nextOverlayAngle;
		})
	}

}
