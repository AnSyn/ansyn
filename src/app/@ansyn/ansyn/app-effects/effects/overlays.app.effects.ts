import { Actions, Effect, ofType } from '@ngrx/effects';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
	DisplayMultipleOverlaysFromStoreAction,
	DisplayOverlayAction,
	DisplayOverlayFromStoreAction,
	DisplayOverlaySuccessAction,
	OverlaysActionTypes,
	SetFilteredOverlaysAction,
	SetHoveredOverlayAction,
	SetSpecialObjectsActionStore
} from '@ansyn/overlays/actions/overlays.actions';
import { Action, Store } from '@ngrx/store';
import { IAppState } from '../app.effects.module';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import {
	IMarkUpData,
	IOverlaysState,
	MarkUpClass,
	overlaysStateSelector,
	selectdisplayOverlayHistory,
	selectDropMarkup,
	selectOverlaysMap
} from '@ansyn/overlays/reducers/overlays.reducer';
import { IOverlay, IOverlaySpecialObject, IPendingOverlay } from '@ansyn/core/models/overlay.model';
import { RemovePendingOverlayAction, SetPendingOverlaysAction } from '@ansyn/map-facade/actions/map.actions';
import { IMapState, mapStateSelector, selectActiveMapId, selectMapsList } from '@ansyn/map-facade/reducers/map.reducer';
import { LayoutKey, layoutOptions } from '@ansyn/core/models/layout-options.model';
import {
	BackToWorldView,
	CoreActionTypes,
	SetLayoutAction,
	SetLayoutSuccessAction,
	SetRemovedOverlaysIdAction,
	SetToastMessageAction,
	ToggleFavoriteAction,
	TogglePresetOverlayAction
} from '@ansyn/core/actions/core.actions';
import { ExtendMap } from '@ansyn/overlays/reducers/extendedMap.class';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { ICaseMapPosition } from '@ansyn/core/models/case-map-position.model';
import { CommunicatorEntity } from '@ansyn/imagery/communicator-service/communicator.entity';
import { catchError, filter, map, mergeMap, share, withLatestFrom } from 'rxjs/operators';
import {
	BaseMapSourceProvider,
	IBaseMapSourceProviderConstructor
} from '@ansyn/imagery/model/base-map-source-provider';
import { IContextParams, selectContextEntities, selectContextsParams } from '@ansyn/context/reducers/context.reducer';
import { SetContextParamsAction } from '@ansyn/context/actions/context.actions';
import { IContextEntity } from '@ansyn/core/models/case.model';
import { DisplayedOverlay } from '@ansyn/core/models/context.model';
import olExtent from 'ol/extent';
import { transformScale } from '@turf/turf';
import { get } from 'lodash';

@Injectable()
export class OverlaysAppEffects {

	/**
	 * @type Effect
	 * @name displayLatestOverlay$
	 * @ofType SetFilteredOverlaysAction
	 * @dependencies overlays
	 * @filter defaultOverlay is latest and displayedOverlays is not empty
	 * @action DisplayOverlayFromStoreAction
	 */
	@Effect()
	displayLatestOverlay$: Observable<any> = this.actions$.pipe(
		ofType<SetFilteredOverlaysAction>(OverlaysActionTypes.SET_FILTERED_OVERLAYS),
		withLatestFrom(this.store$.select(selectContextsParams), this.store$.select(overlaysStateSelector)),
		filter(([action, params, { filteredOverlays }]: [SetFilteredOverlaysAction, IContextParams, IOverlaysState]) => params && params.defaultOverlay === DisplayedOverlay.latest && filteredOverlays.length > 0),
		mergeMap(([action, params, { filteredOverlays }]: [SetFilteredOverlaysAction, IContextParams, IOverlaysState]) => {
			const id = filteredOverlays[filteredOverlays.length - 1];
			return [
				new SetContextParamsAction({ defaultOverlay: null }),
				new DisplayOverlayFromStoreAction({ id })
			];
		}),
		share()
	);


	/**
	 * @type Effect
	 * @name displayTwoNearestOverlay$
	 * @ofType SetFilteredOverlaysAction
	 * @dependencies overlays
	 * @filter defaultOverlay is nearst
	 * @action DisplayMultipleOverlaysFromStoreAction
	 */
	@Effect()
	displayTwoNearestOverlay$: Observable<any> = this.actions$.pipe(
		ofType<SetFilteredOverlaysAction>(OverlaysActionTypes.SET_FILTERED_OVERLAYS),
		withLatestFrom(this.store$.select(selectContextsParams), this.store$.select(overlaysStateSelector)),
		filter(([action, params, { filteredOverlays }]: [SetFilteredOverlaysAction, IContextParams, IOverlaysState]) => params && params.defaultOverlay === DisplayedOverlay.nearest && filteredOverlays.length > 0),
		map(([action, params, { overlays, filteredOverlays }]: [SetFilteredOverlaysAction, IContextParams, IOverlaysState]) => {
			const overlaysBeforeId = [...filteredOverlays].reverse().find(overlayId => overlays.get(overlayId).photoTime < params.time);
			const overlaysBefore = overlays.get(overlaysBeforeId);
			const overlaysAfterId = filteredOverlays.find(overlayId => overlays.get(overlayId).photoTime > params.time);
			const overlaysAfter = overlays.get(overlaysAfterId);
			const featureJson = get(params, 'contextEntities[0].featureJson');
			let extent;
			if (featureJson) {
				const featureJsonScale = transformScale(featureJson, 1.1);
				extent = olExtent.boundingExtent(featureJsonScale.geometry.coordinates[0]);
			}
			const payload = [{ overlay: overlaysBefore, extent }, {
				overlay: overlaysAfter,
				extent
			}].filter(({ overlay }) => Boolean(overlay));
			return new DisplayMultipleOverlaysFromStoreAction(payload);
		}),
		share()
	);

	/**
	 * @type Effect
	 * @name displayMultipleOverlays$
	 * @ofType DisplayMultipleOverlaysFromStoreAction
	 * @dependencies map
	 * @filter there is at least one none empty overlay to display
	 * @action DisplayOverlayFromStoreAction, SetPendingOverlaysAction, ChangeLayoutAction
	 */
	@Effect()
	displayMultipleOverlays$: Observable<any> = this.actions$.pipe(
		ofType(OverlaysActionTypes.DISPLAY_MULTIPLE_OVERLAYS_FROM_STORE),
		filter((action: DisplayMultipleOverlaysFromStoreAction) => action.payload.length > 0),
		withLatestFrom(this.store$.select(mapStateSelector)),
		mergeMap(([action, { mapsList }]: [DisplayMultipleOverlaysFromStoreAction, IMapState]): any => {
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

	/**
	 * @type Effect
	 * @name displayPendingOverlaysOnChangeLayoutSuccess$
	 * @ofType SetLayoutSuccess
	 * @dependencies map
	 * @filter there is at least one pending overlay
	 * @action DisplayOverlayFromStoreAction
	 */
	@Effect()
	displayPendingOverlaysOnChangeLayoutSuccess$: Observable<any> = this.actions$.pipe(
		ofType(CoreActionTypes.SET_LAYOUT_SUCCESS),
		withLatestFrom(this.store$.select(mapStateSelector)),
		filter(([action, mapState]) => mapState.pendingOverlays.length > 0),
		mergeMap(([action, mapState]: [SetLayoutSuccessAction, IMapState]) => {
			return mapState.pendingOverlays.map((pendingOverlay: any, index: number) => {
				const { overlay, extent } = pendingOverlay;
				const mapId = mapState.mapsList[index].id;
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

	/**
	 * @type Effect
	 * @name onDisplayOverlayFromStore$
	 * @ofType DisplayOverlayFromStoreAction
	 * @dependencies overlays, map
	 * @action DisplayOverlayAction
	 */
	@Effect()
	onDisplayOverlayFromStore$: Observable<DisplayOverlayAction> = this.actions$.pipe(
		ofType(OverlaysActionTypes.DISPLAY_OVERLAY_FROM_STORE),
		withLatestFrom(this.store$.select(overlaysStateSelector), this.store$.select(mapStateSelector)),
		map(([{ payload }, { overlays }, { activeMapId }]: [DisplayOverlayFromStoreAction, IOverlaysState, IMapState]) => {
			const mapId = payload.mapId || activeMapId;
			const overlay = overlays.get(payload.id);
			return new DisplayOverlayAction({ overlay, mapId, extent: payload.extent });
		})
	);

	/**
	 * @type Effect
	 * @name onSetRemovedOverlaysIdAction$
	 * @ofType SetRemovedOverlaysIdAction
	 * @dependencies overlays
	 * @filter
	 * @action DisplayOverlayFromStoreAction | BackToWorldView
	 */
	@Effect()
	onSetRemovedOverlaysIdAction$: Observable<any> = this.actions$.pipe(
		ofType<SetRemovedOverlaysIdAction>(CoreActionTypes.SET_REMOVED_OVERLAY_ID),
		filter(({ payload }) => payload.value),
		withLatestFrom(this.store$.select(selectdisplayOverlayHistory), this.store$.select(selectMapsList)),
		mergeMap(([{ payload }, displayOverlayHistory, mapsList]) => {
			const mapActions = mapsList
				.filter((map) => map.data.overlay && (map.data.overlay.id === payload.id))
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

	/**
	 * @type Effect
	 * @name setHoveredOverlay$
	 * @action SetHoveredOverlayAction
	 */

	private getOverlayFromDropMarkup = map(([markupMap, overlays]: [ExtendMap<MarkUpClass, IMarkUpData>, Map<any, any>]) =>
		overlays.get(markupMap && markupMap.get(MarkUpClass.hover).overlaysIds[0])
	);
	private getCommunicatorForActiveMap = map(([overlay, activeMapId]: [IOverlay, string]) => [overlay, this.imageryCommunicatorService.provide(activeMapId)]);
	private getPositionFromCommunicator = mergeMap(([overlay, communicator]: [IOverlay, CommunicatorEntity]) => {
		if (!communicator) {
			return Observable.of([overlay, null]);
		}
		return communicator.getPosition().map((position) => [overlay, position]);
	});
	private getOverlayWithNewThumbnail = mergeMap(([overlay, position]: [IOverlay, ICaseMapPosition]) => {
		if (!overlay) {
			return [overlay];
		}
		const sourceProvider = this.getSourceProvider(overlay.sourceType);
		return (<any>sourceProvider).getThumbnailUrl(overlay, position)
			.map(thumbnailUrl => ({ ...overlay, thumbnailUrl }))
			.catch(err => {
				this.store$.dispatch(new SetToastMessageAction({
					toastText: 'Failed to load overlay preview',
					showWarningIcon: true
				}));
				return null;
			});
	});
	private getHoveredOverlayAction = map((overlay: IOverlay) => new SetHoveredOverlayAction(overlay));

	@Effect()
	setHoveredOverlay$: Observable<any> = this.store$.select(selectDropMarkup)
		.pipe(
			withLatestFrom(this.store$.select(selectOverlaysMap)),
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
				return Observable.of(err);
			})
		);

	@Effect()
	setSpecialObjectsFromContextEntities$: Observable<any> = this.store$.select(selectContextEntities).pipe(
		filter((contextEntities: IContextEntity[]) => Boolean(contextEntities)),
		map((contextEntities: IContextEntity[]): Action => {
			const specialObjects = contextEntities.map(contextEntity => ({
				id: contextEntity.id,
				date: contextEntity.date,
				shape: 'star'
			} as IOverlaySpecialObject));
			return new SetSpecialObjectsActionStore(specialObjects);
		})
	);

	getSourceProvider(sType) {
		return this.baseSourceProviders.find(({ constructor }) => sType === (<IBaseMapSourceProviderConstructor>constructor).sourceType);
	}

	constructor(public actions$: Actions,
				public store$: Store<IAppState>,
				public overlaysService: OverlaysService,
				@Inject(BaseMapSourceProvider) public baseSourceProviders: BaseMapSourceProvider[],
				public imageryCommunicatorService: ImageryCommunicatorService) {
	}

}
