import { Actions, Effect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { combineLatest, forkJoin, Observable, of, pipe } from 'rxjs';
import { Store } from '@ngrx/store';
import {
	IMapState,
	IPendingOverlay,
	LayoutKey,
	layoutOptions,
	MapActionTypes,
	mapStateSelector,
	RemovePendingOverlayAction,
	selectActiveMapId,
	selectFooterCollapse,
	selectMaps,
	selectMapsList,
	SetLayoutAction,
	SetLayoutSuccessAction,
	SetPendingOverlaysAction
} from '@ansyn/map-facade';
import { OverlayStatusActionsTypes } from '../../modules/overlays/overlay-status/actions/overlay-status.actions';
import { IAppState } from '../app.effects.module';


import { IImageryMapPosition } from '@ansyn/imagery';
import {
	catchError,
	filter,
	map,
	mergeMap,
	switchMap,
	tap,
	withLatestFrom,
	distinctUntilKeyChanged,
	distinctUntilChanged
} from 'rxjs/operators';
import { isEqual } from 'lodash';
import {
	DisplayFourViewAction,
	DisplayMultipleOverlaysFromStoreAction,
	DisplayOverlayAction,
	DisplayOverlayFromStoreAction,
	DisplayOverlaySuccessAction,
	OverlaysActionTypes,
	SetHoveredOverlayAction,
	SetMarkUp,
	SetTotalOverlaysAction
} from '../../modules/overlays/actions/overlays.actions';
import {
	IMarkUpData,
	MarkUpClass,
	selectDropMarkup,
	selectOverlaysCriteria
} from '../../modules/overlays/reducers/overlays.reducer';
import { ExtendMap } from '../../modules/overlays/reducers/extendedMap.class';
import { overlayOverviewComponentConstants } from '../../modules/overlays/components/overlay-overview/overlay-overview.component.const';
import { OverlaysService } from '../../modules/overlays/services/overlays.service';
import { ICaseMapState } from '../../modules/menu-items/cases/models/case.model';
import {
	GeoRegisteration,
	IOverlay,
	IOverlaysCriteria,
	IOverlaysFetchData
} from '../../modules/overlays/models/overlay.model';
import { Dictionary } from '@ngrx/entity';
import { LoggerService } from '../../modules/core/services/logger.service';
import { SetBadgeAction } from '@ansyn/menu';
import { IAngleParams, IFetchParams } from '../../modules/overlays/models/base-overlay-source-provider.model';
import { MultipleOverlaysSourceProvider } from '../../modules/overlays/services/multiple-source-provider';

@Injectable()
export class OverlaysAppEffects {

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

	@Effect({ dispatch: false })
	actionsLogger$: Observable<any> = this.actions$.pipe(
		ofType(
			OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS,
			OverlaysActionTypes.CHECK_TRIANGLES,
			OverlaysActionTypes.LOAD_OVERLAYS,
			OverlaysActionTypes.LOAD_OVERLAYS_FAIL,
			OverlaysActionTypes.SET_OVERLAYS_CRITERIA,
			OverlayStatusActionsTypes.ACTIVATE_SCANNED_AREA,
			OverlayStatusActionsTypes.TOGGLE_OVERLAY_FAVORITE,
			OverlayStatusActionsTypes.ADD_ALERT_MSG,
			OverlayStatusActionsTypes.REMOVE_ALERT_MSG,
			OverlayStatusActionsTypes.TOGGLE_DRAGGED_MODE
		),
		tap((action) => {
			this.loggerService.info(action.payload ? JSON.stringify(action.payload) : '', 'Overlays', action.type);
		}));

	@Effect()
	onDisplayFourView: Observable<any> = this.actions$.pipe(
		ofType<DisplayFourViewAction>(OverlaysActionTypes.DISPLAY_FOUR_VIEW),
		filter(Boolean),
		withLatestFrom(this.store$.select(selectOverlaysCriteria)),
		mergeMap(([action, criteria]: [DisplayFourViewAction, IOverlaysCriteria]): any => {
			this.store$.dispatch(new SetPendingOverlaysAction(action.payload));
			const overlayObservables: Observable<IOverlaysFetchData>[] = this.getFourViewOverlays(criteria);

			return forkJoin(overlayObservables).pipe(
				map((overlaysData: IOverlaysFetchData[]) => {
					const overlays: IPendingOverlay[] = [];

					overlaysData.forEach(({ data }) => {
						const geoRegisteredOverlays = data.filter(({ isGeoRegistered }) => isGeoRegistered !== GeoRegisteration.notGeoRegistered);
						const [overlay] = geoRegisteredOverlays.length ? geoRegisteredOverlays : data;
						overlays.push({ overlay});
					});
					this.store$.dispatch(new SetPendingOverlaysAction(overlays));

					const fourMapsLayout = 'layout6';
					return new SetLayoutAction(fourMapsLayout);
				})
			)
		})
	);


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
			const validPendingOverlays = mapState.pendingOverlays.filter(overlay => Boolean(overlay));
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
		filter(([action, mapState]: [DisplayOverlaySuccessAction, IMapState]) => mapState.pendingOverlays.some((pending: any) => pending.id === action.payload.overlay.id)),
		map(([action, mapState]: [DisplayOverlaySuccessAction, IMapState]) => {
			return new RemovePendingOverlayAction(action.payload.overlay.id);
		})
	);

	@Effect()
	onDisplayOverlayFromStore$: Observable<DisplayOverlayAction> = this.actions$.pipe(
		ofType(OverlaysActionTypes.DISPLAY_OVERLAY_FROM_STORE),
		withLatestFrom(this.overlaysService.getAllOverlays$, this.store$.select(mapStateSelector)),
		filter(([{ payload }, overlays, { activeMapId }]: [DisplayOverlayFromStoreAction, Map<string, IOverlay>, IMapState]) => overlays && overlays.has(payload.id)),
		map(([{ payload }, overlays, { activeMapId }]: [DisplayOverlayFromStoreAction, Map<string, IOverlay>, IMapState]) => {
			const mapId = payload.mapId || activeMapId;
			const overlay = overlays.get(payload.id);
			return new DisplayOverlayAction({
				overlay,
				mapId,
				extent: payload.extent,
				customOriantation: payload.customOriantation
			});
		})
	);

	@Effect()
	setHoveredOverlay$: Observable<any> = combineLatest([this.store$.select(selectDropMarkup), this.store$.select(selectFooterCollapse)])
		.pipe(
			filter(([drop, footerCollapse]) => Boolean(!footerCollapse)),
			distinctUntilChanged( isEqual),
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
		map((action) => new SetBadgeAction({ key: 'Results table', badge: `${ action.payload }` })));

	constructor(public actions$: Actions,
				public store$: Store<IAppState>,
				private sourceProvider: MultipleOverlaysSourceProvider,
				public overlaysService: OverlaysService,
				protected loggerService: LoggerService) {
	}

	getFourViewOverlays(criteria: IOverlaysCriteria): Observable<IOverlaysFetchData>[] {
		const params: IFetchParams = {
			timeRange: {
				start: criteria.time.from,
				end: criteria.time.to
			},
			region: criteria.region,
			limit: this.overlaysService.config.limit,
			dataInputFilters: []
		};

		const angleParams: IAngleParams[] = [
			{
				firstAngle: 0,
				secondAngle: 90
			},
			{
				firstAngle: 90,
				secondAngle: 180
			},
			{
				firstAngle: 180,
				secondAngle: 270
			},
			{
				firstAngle: 270,
				secondAngle: 360
			}
		];

		return angleParams.map(angleParam => {
			params.angleParams = angleParam;
			return this.sourceProvider.fetch(params);
		});
	}

	onDropMarkupFilter([prevAction, currentAction]): boolean {
		const isEquel = !isEqual(prevAction, currentAction);
		return isEquel;
	}
}
