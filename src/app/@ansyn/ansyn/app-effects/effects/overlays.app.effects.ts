import { Actions, Effect, ofType } from '@ngrx/effects';
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

import { CommunicatorEntity, ImageryCommunicatorService, ImageryMapPosition } from '@ansyn/imagery';
import {
	catchError,
	distinctUntilChanged,
	filter,
	map,
	mergeMap,
	pairwise,
	startWith,
	switchMap,
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

@Injectable()
export class OverlaysAppEffects {

	region$ = this.store$.select(selectRegion);

	isPinPointSearch$ = this.region$.pipe(
		filter(Boolean),
		map((region) => region.type === CaseGeoFilter.PinPoint),
		distinctUntilChanged()
	);

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
	clearPresets$: Observable<any> = this.actions$.pipe(
		ofType<LoadOverlaysAction>(OverlaysActionTypes.LOAD_OVERLAYS),
		map(() => new SetPresetOverlaysAction([]))
	);


	@Effect()
	onPinPointSearch$: Observable<SetOverlaysCriteriaAction | any> = this.actions$.pipe(
		ofType<ContextMenuTriggerAction>(MapActionTypes.TRIGGER.CONTEXT_MENU),
		withLatestFrom(this.isPinPointSearch$),
		filter(([{ payload }, isPinPointSearch]: [ContextMenuTriggerAction, boolean]) => isPinPointSearch),
		map(([{ payload }, isPinPointSearch]: [ContextMenuTriggerAction, boolean]) => payload),
		map((payload: Position) => {
			const region = turf.geometry('Point', payload);
			return new SetOverlaysCriteriaAction({ region });
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
		map(([{ payload }, overlays, { activeMapId }]: [DisplayOverlayFromStoreAction, Map<string, IOverlay>, IMapState]) => {
			const mapId = payload.mapId || activeMapId;
			const overlay = overlays.get(payload.id);
			return new DisplayOverlayAction({ overlay, mapId, extent: payload.extent, openWithAngle: payload.openWithAngle });
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

	onDropMarkupFilter([prevAction, currentAction]): boolean {
		const isEquel = !isEqual(prevAction, currentAction);
		return isEquel;
	}

	constructor(public actions$: Actions,
				public store$: Store<IAppState>,
				public overlaysService: OverlaysService,
				public imageryCommunicatorService: ImageryCommunicatorService) {
	}

}
