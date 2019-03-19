import { Actions, Effect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
	DisplayMultipleOverlaysFromStoreAction,
	DisplayOverlayAction,
	DisplayOverlayFromStoreAction,
	DisplayOverlaySuccessAction,
	ExtendMap,
	IMarkUpData,
	IOverlaysState,
	MarkUpClass,
	overlayOverviewComponentConstants,
	OverlaysActionTypes,
	OverlaysService,
	overlaysStateSelector,
	selectdisplayOverlayHistory,
	selectDropMarkup,
	SetFilteredOverlaysAction,
	SetHoveredOverlayAction,
	SetMarkUp,
	SetSpecialObjectsActionStore
} from '../../modules/overlays/public_api';
import { Action, Store } from '@ngrx/store';
import { IAppState } from '../app.effects.module';
import {
	BackToWorldView,
	CoreActionTypes,
	DisplayedOverlay,
	ICaseMapPosition,
	ICaseMapState,
	IContextEntity,
	IOverlay,
	IOverlaySpecialObject,
	IPendingOverlay,
	LayoutKey,
	layoutOptions,
	SetLayoutAction,
	SetLayoutSuccessAction,
	SetRemovedOverlaysIdAction,
	ToggleFavoriteAction,
	TogglePresetOverlayAction
} from '@ansyn/core';
import {
	IMapState,
	MapActionTypes,
	mapStateSelector,
	RemovePendingOverlayAction,
	selectActiveMapId,
	selectMapsList,
	SetPendingOverlaysAction
} from '@ansyn/map-facade';
import { CommunicatorEntity, ImageryCommunicatorService } from '@ansyn/imagery';
import {
	catchError,
	filter,
	map,
	mergeMap,
	pairwise,
	startWith,
	switchMap,
	withLatestFrom
} from 'rxjs/operators';
import { isEqual } from 'lodash';

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
		ofType(CoreActionTypes.SET_LAYOUT_SUCCESS),
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
			return new DisplayOverlayAction({ overlay, mapId, extent: payload.extent });
		})
	);

	@Effect()
	onSetRemovedOverlaysIdAction$: Observable<any> = this.actions$.pipe(
		ofType<SetRemovedOverlaysIdAction>(CoreActionTypes.SET_REMOVED_OVERLAY_ID),
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
		overlays.get(markupMap && markupMap.get(MarkUpClass.hover).overlaysIds[0])
	);
	private getCommunicatorForActiveMap = map(([overlay, activeMapId]: [IOverlay, string]) => {
		const result = [overlay, this.imageryCommunicatorService.provide(activeMapId)];
		return result;
	});
	private getPositionFromCommunicator = mergeMap(([overlay, communicator]: [IOverlay, CommunicatorEntity]) => {
		if (!communicator) {
			return of([overlay, null]);
		}
		return communicator.getPosition().pipe(map((position) => [overlay, position, communicator]));
	});
	private getOverlayWithNewThumbnail: any = switchMap(([overlay, position, communicator]: [IOverlay, ICaseMapPosition, CommunicatorEntity]) => {
		if (!overlay) {
			return [overlay];
		}
		this.store$.dispatch(new SetHoveredOverlayAction(<IOverlay>{
			...overlay,
			thumbnailUrl: overlayOverviewComponentConstants.FETCHING_OVERLAY_DATA
		}));
		const sourceProvider = communicator.getMapSourceProvider({
			mapType: communicator.activeMapName,
			sourceType: overlay.sourceType
		});
		return sourceProvider.getThumbnailUrl(overlay, position).pipe(
			map(thumbnailUrl => ({
				...overlay,
				thumbnailUrl,
				thumbnailName: sourceProvider.getThumbnailName(overlay)
			})),
			catchError(() => {
				return of(overlay);
			})
		);
	});
	private getHoveredOverlayAction = map((overlay: IOverlay) => {
		return new SetHoveredOverlayAction(overlay)
	});

	@Effect()
	setHoveredOverlay$: Observable<any> = this.store$.select(selectDropMarkup)
		.pipe(
			startWith(null),
			pairwise(),
			filter(this.onDropMarkupFilter.bind(this)),
			map(([prevAction, currentAction]) => currentAction),
			withLatestFrom(this.overlaysService.getAllOverlays$),
			this.getOverlayFromDropMarkup,
			withLatestFrom(this.store$.select(selectActiveMapId)),
			this.getCommunicatorForActiveMap,
			this.getPositionFromCommunicator,
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
