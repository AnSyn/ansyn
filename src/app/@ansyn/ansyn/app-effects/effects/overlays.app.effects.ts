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
import {
	BackToWorldView,
	OverlayStatusActionsTypes,
	SetPresetOverlaysAction,
	SetRemovedOverlayIdsCount,
	SetRemovedOverlaysIdAction,
	ToggleFavoriteAction,
	TogglePresetOverlayAction
} from '../../modules/overlays/overlay-status/actions/overlay-status.actions';
import { selectRemovedOverlays } from '../../modules/overlays/overlay-status/reducers/overlay-status.reducer';
import { IAppState } from '../app.effects.module';

import { ImageryMapPosition } from '@ansyn/imagery';
import {
	catchError,
	filter,
	map,
	mergeMap,
	pairwise,
	startWith,
	switchMap,
	tap,
	withLatestFrom
} from 'rxjs/operators';
import { isEqual } from 'lodash';
import {
	DisplayFourViewAction,
	DisplayMultipleOverlaysFromStoreAction,
	DisplayOverlayAction,
	DisplayOverlayFromStoreAction,
	DisplayOverlaySuccessAction,
	LoadOverlaysAction,
	LoadOverlaysSuccessAction,
	OverlaysActionTypes,
	SetHoveredOverlayAction,
	SetMarkUp,
	SetTotalOverlaysAction
} from '../../modules/overlays/actions/overlays.actions';
import {
	IMarkUpData,
	MarkUpClass,
	selectdisplayOverlayHistory,
	selectDropMarkup, selectOverlaysCriteria,
	selectOverlaysMap
} from '../../modules/overlays/reducers/overlays.reducer';
import { ExtendMap } from '../../modules/overlays/reducers/extendedMap.class';
import { overlayOverviewComponentConstants } from '../../modules/overlays/components/overlay-overview/overlay-overview.component.const';
import { OverlaysService } from '../../modules/overlays/services/overlays.service';
import { ICaseMapState } from '../../modules/menu-items/cases/models/case.model';
import { IOverlay, IOverlaysCriteria, IOverlaysFetchData } from '../../modules/overlays/models/overlay.model';
import { Dictionary } from '@ngrx/entity';
import { LoggerService } from '../../modules/core/services/logger.service';
import { SetBadgeAction } from '@ansyn/menu';
import { MultipleOverlaysSourceProvider } from "../../modules/overlays/services/multiple-source-provider";
import { IFetchParams } from "../../modules/overlays/models/base-overlay-source-provider.model";

@Injectable()
export class OverlaysAppEffects {

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
			OverlayStatusActionsTypes.TOGGLE_DRAGGED_MODE,
			OverlayStatusActionsTypes.TOGGLE_OVERLAY_PRESET
		),
		tap((action) => {
			this.loggerService.info(action.payload ? JSON.stringify(action.payload) : '', 'Overlays', action.type);
		}));

	@Effect()
	removedOverlaysCount$ = combineLatest(this.store$.select(selectRemovedOverlays), this.store$.select(selectOverlaysMap)).pipe(
		map(([removedOverlaysIds, overlays]: [string[], Map<string, IOverlay>]) => {
			const removedOverlaysCount = removedOverlaysIds.filter((removedId) => overlays.has(removedId)).length;
			return new SetRemovedOverlayIdsCount(removedOverlaysCount);
		})
	);

	@Effect()
	clearPresetsOnClearOverlays$: Observable<any> = this.actions$.pipe(
		ofType<LoadOverlaysSuccessAction>(OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS),
		filter(({ clearExistingOverlays }) => clearExistingOverlays),
		map(() => new SetPresetOverlaysAction([]))
	);

	@Effect()
	onDisplayFourView: Observable<any> = this.actions$.pipe(
		ofType<DisplayFourViewAction>(OverlaysActionTypes.DISPLAY_FOUR_VIEW),
		filter(Boolean),
		withLatestFrom(this.store$.select(selectOverlaysCriteria)),
		map(([action, criteria]: [DisplayFourViewAction, IOverlaysCriteria]) => {
			const overlayObservables: Observable<IOverlaysFetchData>[] = [];
			const params: IFetchParams = {
				limit: this.overlaysService.config.limit,
				dataInputFilters: [],
				timeRange: {
					start: criteria.time.from,
					end: criteria.time.to
				},
				region: criteria.region,
				angleParams: {
					firstAngle: 0,
					secondAngle: 90
				}
			};

			for (let i = 0; i < 4; i++) {
				overlayObservables.push(this.sourceProvider.fetch(params));
				params.angleParams.firstAngle += 90;
				params.angleParams.secondAngle += 90;
			}

			return forkJoin(overlayObservables).pipe(
				map((overlaysData: any[]) => {
					const pendingOverlays: IPendingOverlay[] = [];
					overlaysData.forEach(overlayData => pendingOverlays.push({overlay: overlayData.data}));
					
					this.store$.dispatch(new SetPendingOverlaysAction(pendingOverlays));
					return new SetLayoutAction('layout6');
				})
			);
		})
	);

	@Effect()
	clearPresets$: Observable<any> = this.actions$.pipe(
		ofType<LoadOverlaysAction>(OverlaysActionTypes.LOAD_OVERLAYS),
		map(() => new SetPresetOverlaysAction([]))
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
			return mapState.pendingOverlays.map((pendingOverlay: any, index: number) => {
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
		filter(([action, mapState]: [DisplayOverlaySuccessAction, IMapState]) => mapState.pendingOverlays.some((pending) => pending.overlay.id === action.payload.overlay.id)),
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
	onSetRemovedOverlaysIdAction$: Observable<any> = this.actions$.pipe(
		ofType<SetRemovedOverlaysIdAction>(OverlayStatusActionsTypes.SET_REMOVED_OVERLAY_ID),
		filter(({ payload }) => payload.value),
		withLatestFrom(this.store$.select(selectdisplayOverlayHistory), this.store$.select(selectMapsList)),
		mergeMap(([{ payload }, displayOverlayHistory, mapsList]) => {
			const mapActions = mapsList
				.filter((map) => map.data.overlay && (map.data.overlay.id === payload.id) && (map.id === payload.mapId))
				.map((map) => {
					const mapId = map.id;
					const id = (displayOverlayHistory[mapId] || []).pop();
					if (Boolean(id)) {
						return new DisplayOverlayFromStoreAction({ mapId, id });
					}
					return new BackToWorldView({ mapId });
				});
			return [
				new ToggleFavoriteAction({ value: false, id: payload.id }),
				new TogglePresetOverlayAction({ value: false, id: payload.id }),
				...mapActions
			];
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

	private getOverlayWithNewThumbnail: any = switchMap(([overlay, position]: [IOverlay, ImageryMapPosition]) => {
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
	setHoveredOverlay$: Observable<any> = combineLatest(this.store$.select(selectDropMarkup), this.store$.select(selectFooterCollapse))
		.pipe(
			filter(([drop, footerCollapse]) => Boolean(!footerCollapse)),
			startWith(null),
			pairwise(),
			filter(this.onDropMarkupFilter.bind(this)),
			map(([prevAction, currentAction]) => currentAction),
			withLatestFrom(this.overlaysService.getAllOverlays$, ([drop, footer], overlays) => [drop, overlays]),
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
		map((action) => new SetBadgeAction({ key: 'Results table', badge: `${ action.payload }` })));

	onDropMarkupFilter([prevAction, currentAction]): boolean {
		const isEquel = !isEqual(prevAction, currentAction);
		return isEquel;
	}

	constructor(public actions$: Actions,
				private sourceProvider: MultipleOverlaysSourceProvider,
				public store$: Store<IAppState>,
				public overlaysService: OverlaysService,
				protected loggerService: LoggerService) {
	}

}
