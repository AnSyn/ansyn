import { Actions, Effect, ofType, createEffect } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { combineLatest, Observable, of, pipe } from 'rxjs';
import { Store } from '@ngrx/store';
import {
	ContextMenuTriggerAction,
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
	distinctUntilChanged,
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
	DisplayMultipleOverlaysFromStoreAction,
	DisplayOverlayAction,
	DisplayOverlayFromStoreAction,
	DisplayOverlaySuccessAction,
	LoadOverlaysAction,
	LoadOverlaysSuccessAction,
	OverlaysActionTypes,
	SetHoveredOverlayAction,
	SetMarkUp,
	SetOverlaysCriteriaAction
} from '../../modules/overlays/actions/overlays.actions';
import {
	IMarkUpData,
	MarkUpClass,
	selectdisplayOverlayHistory,
	selectDropMarkup,
	selectOverlaysMap,
	selectRegion
} from '../../modules/overlays/reducers/overlays.reducer';
import { ExtendMap } from '../../modules/overlays/reducers/extendedMap.class';
import { overlayOverviewComponentConstants } from '../../modules/overlays/components/overlay-overview/overlay-overview.component.const';
import { OverlaysService } from '../../modules/overlays/services/overlays.service';
import * as turf from '@turf/turf';
import { Position } from 'geojson';
import { CaseGeoFilter, ICaseMapState } from '../../modules/menu-items/cases/models/case.model';
import { IOverlay } from '../../modules/overlays/models/overlay.model';
import { Dictionary } from '@ngrx/entity';
import { LoggerService } from '../../modules/core/services/logger.service';

@Injectable()
export class OverlaysAppEffects {

	region$ = this.store$.select(selectRegion);

	isPinPointSearch$ = this.region$.pipe(
		filter(Boolean),
		map<any, Boolean>((region) => region.type === CaseGeoFilter.PinPoint),
		distinctUntilChanged()
	);

	@Effect({ dispatch: false }) // TODO: leaving as it is for now, because we also nned to the action type.
	actionsLogger$: Observable<any> = this.actions$.pipe(
		ofType(
			OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS,
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

	removedOverlaysCount$ = createEffect(() => combineLatest(this.store$.select(selectRemovedOverlays), this.store$.select(selectOverlaysMap)).pipe(
		map(([removedOverlaysIds, overlays]: [string[], Map<string, IOverlay>]) => {
			const removedOverlaysCount = removedOverlaysIds.filter((removedId) => overlays.has(removedId)).length;
			return SetRemovedOverlayIdsCount({payload: removedOverlaysCount});
		}))
	);

	clearPresetsOnClearOverlays$ = createEffect(() => this.actions$.pipe(
		ofType(LoadOverlaysSuccessAction),
		filter(({ clearExistingOverlays }) => clearExistingOverlays),
		map(() => SetPresetOverlaysAction({ payload: [] })))
	);

	clearPresets$ = createEffect(() => this.actions$.pipe(
		ofType(LoadOverlaysAction),
		map(() => SetPresetOverlaysAction({ payload: [] }))
	));

	onPinPointSearch$ = createEffect(() => this.actions$.pipe(
		ofType(ContextMenuTriggerAction),
		withLatestFrom(this.isPinPointSearch$),
		filter(([{ payload }, isPinPointSearch]: [any, boolean]) => isPinPointSearch),
		map(([{ payload }, isPinPointSearch]: [any, boolean]) => payload),
		map((payload: Position) => {
			const region = turf.geometry('Point', payload);
			return  SetOverlaysCriteriaAction({ payload: { region },
												options: {}});
		}))
	);



	// @Effect()
	// displayMultipleOverlays$ = this.actions$.pipe(
	// 	ofType(DisplayMultipleOverlaysFromStoreAction),
	// 	filter((action) => action.payload.length > 0),
	// 	withLatestFrom(this.store$.select(selectMapsList)),
	// 	mergeMap(([action, mapsList]: [any, ICaseMapState[]]): any => {
	// 		const validPendingOverlays = action.payload;
	// 		/* theoretical situation */
	// 		if (validPendingOverlays.length <= mapsList.length) {
	// 			return validPendingOverlays.map((pendingOverlay: IPendingOverlay, index: number) => {
	// 				let { overlay, extent } = pendingOverlay;
	// 				let mapId = mapsList[index].id;
	// 				return DisplayOverlayAction({ overlay, mapId, extent });
	// 			});
	// 		}

	// 		const layout = Array.from(layoutOptions.keys()).find((key: LayoutKey) => {
	// 			const layout = layoutOptions.get(key);
	// 			return layout.mapsCount === validPendingOverlays.length;
	// 		});
	// 		return [new SetPendingOverlaysAction(validPendingOverlays), new SetLayoutAction(layout)];
	// 	})
	// );



	displayMultipleOverlays$ = createEffect(() => this.actions$.pipe(
		ofType(DisplayMultipleOverlaysFromStoreAction),
		filter(payload => payload.payload.length > 0),
		withLatestFrom(this.store$.select(selectMapsList)),
		mergeMap(([payload, mapsList]: [any, ICaseMapState[]]): any => {
			const validPendingOverlays = payload.payload;
			/* theoretical situation */
			if (validPendingOverlays.length <= mapsList.length) {
				return validPendingOverlays.map((pendingOverlay: IPendingOverlay, index: number) => {
					let { overlay, extent } = pendingOverlay;
					let mapId = mapsList[index].id;
					return DisplayOverlayAction({ overlay, mapId, extent });
				});
			}

			const layout = Array.from(layoutOptions.keys()).find((key: LayoutKey) => {
				const layout = layoutOptions.get(key);
				return layout.mapsCount === validPendingOverlays.length;
			});
			return [SetPendingOverlaysAction(validPendingOverlays), SetLayoutAction({ key: layout})];
		})
	));

	displayPendingOverlaysOnChangeLayoutSuccess$ = createEffect(() => this.actions$.pipe(
		ofType(MapActionTypes.SET_LAYOUT_SUCCESS),
		withLatestFrom(this.store$.select(mapStateSelector)),
		filter(([payload, mapState]) => mapState.pendingOverlays.length > 0),
		mergeMap(([payload, mapState]: [any, IMapState]) => {
			return mapState.pendingOverlays.map((pendingOverlay: any, index: number) => {
				const { overlay, extent } = pendingOverlay;
				const mapId = Object.values(mapState.entities)[index].id;
				return DisplayOverlayAction({ overlay, mapId, extent });
			});
		}))
	);

	removePendingOverlayOnDisplay$ = createEffect(() => this.actions$.pipe(
		ofType(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS),
		withLatestFrom(this.store$.select(mapStateSelector)),
		filter(([payload, mapState]: [any, IMapState]) => mapState.pendingOverlays.some((pending) => pending.overlay.id === payload.payload.overlay.id)),
		map(([payload, mapState]: [any, IMapState]) => {
			return RemovePendingOverlayAction(payload.payload.overlay.id);
		}))
	);

	onDisplayOverlayFromStore$ = createEffect(() => this.actions$.pipe(
		ofType(DisplayOverlayFromStoreAction),
		withLatestFrom(this.overlaysService.getAllOverlays$, this.store$.select(mapStateSelector)),
		map(([payload, overlays, { activeMapId }]: [{ id: string, mapId?: string, extent?: any, customOriantation?: string }, Map<string, IOverlay>, IMapState]) => {
			const mapId = payload.mapId || activeMapId;
			const overlay = overlays.get(payload.id);
			return DisplayOverlayAction({
				overlay,
				mapId,
				extent: payload.extent,
				customOriantation: payload.customOriantation
			});
		}))
	);

	onSetRemovedOverlaysIdAction$ = createEffect(this.actions$.pipe(
		ofType(SetRemovedOverlaysIdAction),
		filter(payload => payload.value),
		withLatestFrom(this.store$.select(selectdisplayOverlayHistory), this.store$.select(selectMapsList)),
		mergeMap(([payload, displayOverlayHistory, mapsList]) => {
			const mapActions = mapsList
				.filter((map) => map.data.overlay && (map.data.overlay.id === payload.id) && (map.id === payload.mapId))
				.map((map) => {
					const mapId = map.id;
					const id = (displayOverlayHistory[mapId] || []).pop();
					if (Boolean(id)) {
						return DisplayOverlayFromStoreAction({ mapId, id });
					}
					return BackToWorldView({ mapId });
				});
			return [
				ToggleFavoriteAction({ value: false, id: payload.id }),
				TogglePresetOverlayAction({ value: false, id: payload.id }),
				...mapActions
			];
		}))
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
		this.store$.dispatch(SetHoveredOverlayAction({ payload: {
			...overlay,
			thumbnailUrl: overlayOverviewComponentConstants.FETCHING_OVERLAY_DATA
			}
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
		return SetHoveredOverlayAction({payload: overlay});
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

	activeMapLeave$ = createEffect(() => this.actions$.pipe(
		ofType(MapActionTypes.TRIGGER.IMAGERY_MOUSE_LEAVE),
		map(() => SetMarkUp({ classToSet: MarkUpClass.hover, dataToSet: { overlaysIds: [] } }))
	));

	onDropMarkupFilter([prevAction, currentAction]): boolean {
		const isEquel = !isEqual(prevAction, currentAction);
		return isEquel;
	}

	constructor(public actions$: Actions,
				public store$: Store<IAppState>,
				public overlaysService: OverlaysService,
				protected loggerService: LoggerService) {
	}
}
