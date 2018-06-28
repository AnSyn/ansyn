import { Actions, Effect } from '@ngrx/effects';
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
	IOverlaysState,
	MarkUpClass,
	MarkUpData,
	overlaysStateSelector,
	selectDropMarkup,
	selectOverlaysMap
} from '@ansyn/overlays/reducers/overlays.reducer';
import { Overlay, OverlaySpecialObject } from '@ansyn/core/models/overlay.model';
import {
	RemovePendingOverlayAction,
	SetPendingOverlaysAction,
	SynchronizeMapsAction
} from '@ansyn/map-facade/actions/map.actions';
import { IMapState, mapStateSelector, selectActiveMapId } from '@ansyn/map-facade/reducers/map.reducer';
import { LayoutKey, layoutOptions } from '@ansyn/core/models/layout-options.model';
import { CoreActionTypes, SetLayoutAction } from '@ansyn/core/actions/core.actions';
import { ExtendMap } from '@ansyn/overlays/reducers/extendedMap.class';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { CaseMapPosition } from '@ansyn/core/models/case-map-position.model';
import { CommunicatorEntity } from '@ansyn/imagery/communicator-service/communicator.entity';
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { BaseMapSourceProvider, BaseMapSourceProviderConstructor } from '@ansyn/imagery/model/base-map-source-provider';
import {
	ContextParams,
	selectContextEntities,
	selectContextsParams
} from '@ansyn/context/reducers/context.reducer';
import { SetContextParamsAction } from '@ansyn/context/actions/context.actions';
import { IContextEntity } from '@ansyn/core/models/case.model';
import { DisplayedOverlay } from '@ansyn/core/models/context.model';

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
	displayLatestOverlay$: Observable<any> = this.actions$
		.ofType<SetFilteredOverlaysAction>(OverlaysActionTypes.SET_FILTERED_OVERLAYS)
		.withLatestFrom(this.store$.select(selectContextsParams), this.store$.select(overlaysStateSelector))
		.filter(([action, params, { filteredOverlays }]: [SetFilteredOverlaysAction, ContextParams, IOverlaysState]) => params && params.defaultOverlay === DisplayedOverlay.latest && filteredOverlays.length > 0)
		.mergeMap(([action, params, { filteredOverlays }]: [SetFilteredOverlaysAction, ContextParams, IOverlaysState]) => {
			const id = filteredOverlays[filteredOverlays.length - 1];
			return [
				new SetContextParamsAction({ defaultOverlay: null }),
				new DisplayOverlayFromStoreAction({ id })
			]
		})
		.share();


	/**
	 * @type Effect
	 * @name displayTwoNearestOverlay$
	 * @ofType SetFilteredOverlaysAction
	 * @dependencies overlays
	 * @filter defaultOverlay is nearst
	 * @action DisplayMultipleOverlaysFromStoreAction
	 */
	@Effect()
	displayTwoNearestOverlay$: Observable<any> = this.actions$
		.ofType<SetFilteredOverlaysAction>(OverlaysActionTypes.SET_FILTERED_OVERLAYS)
		.withLatestFrom(this.store$.select(selectContextsParams), this.store$.select(overlaysStateSelector))
		.filter(([action, params, { filteredOverlays }]: [SetFilteredOverlaysAction, ContextParams, IOverlaysState]) => params && params.defaultOverlay === DisplayedOverlay.nearest && filteredOverlays.length > 0)
		.map(([action, params, { overlays, filteredOverlays }]: [SetFilteredOverlaysAction, ContextParams, IOverlaysState]) => {
			const overlaysBefore = [...filteredOverlays].reverse().find(overlay => overlays.get(overlay).photoTime < params.time);
			const overlaysAfter = filteredOverlays.find(overlay => overlays.get(overlay).photoTime > params.time);
			return new DisplayMultipleOverlaysFromStoreAction([overlaysBefore, overlaysAfter].filter(overlay => overlay));
		})
		.share();

	/**
	 * @type Effect
	 * @name displayMultipleOverlays$
	 * @ofType DisplayMultipleOverlaysFromStoreAction
	 * @dependencies map
	 * @filter there is at least one none empty overlay to display
	 * @action DisplayOverlayFromStoreAction, SetPendingOverlaysAction, ChangeLayoutAction
	 */
	@Effect()
	displayMultipleOverlays$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.DISPLAY_MULTIPLE_OVERLAYS_FROM_STORE)
		.filter((action: DisplayMultipleOverlaysFromStoreAction) => action.payload.length > 0)
		.withLatestFrom(this.store$.select(mapStateSelector))
		.mergeMap(([action, { mapsList }]: [DisplayMultipleOverlaysFromStoreAction, IMapState]) => {
			const validOverlays = action.payload.filter((overlay) => overlay);

			if (validOverlays.length <= mapsList.length) {
				const actionsArray = [];

				for (let index = 0; index < validOverlays.length; index++) {
					let overlay = validOverlays[index];
					let mapId = mapsList[index].id;

					actionsArray.push(new DisplayOverlayFromStoreAction({ id: overlay, mapId: mapId }));
				}

				actionsArray.push(new SynchronizeMapsAction({ mapId: mapsList[0].id }));

				return actionsArray;
			}
			else {
				const layout = Array.from(layoutOptions.keys()).find((key: LayoutKey) => {
					const layout = layoutOptions.get(key);
					return layout.mapsCount === validOverlays.length;
				});
				return [new SetPendingOverlaysAction(validOverlays), new SetLayoutAction(layout)];
			}
		});

	/**
	 * @type Effect
	 * @name displayPendingOverlaysOnChangeLayoutSuccess$
	 * @ofType SetLayoutSuccess
	 * @dependencies map
	 * @filter there is at least one pending overlay
	 * @action DisplayOverlayFromStoreAction
	 */
	@Effect()
	displayPendingOverlaysOnChangeLayoutSuccess$: Observable<any> = this.actions$
		.ofType(CoreActionTypes.SET_LAYOUT_SUCCESS)
		.withLatestFrom(this.store$.select(mapStateSelector))
		.filter(([action, mapState]) => mapState.pendingOverlays.length > 0)
		.mergeMap(([action, mapState]) => {
			const actionsArray = [];

			for (let index = 0; index < mapState.pendingOverlays.length; index++) {
				let overlay = mapState.pendingOverlays[index];
				let mapId = mapState.mapsList[index].id;

				actionsArray.push(new DisplayOverlayFromStoreAction({ id: overlay, mapId: mapId }));
			}

			actionsArray.push(new SynchronizeMapsAction({ mapId: mapState.mapsList[0].id }));

			return actionsArray;
		});

	@Effect()
	removePendingOverlayOnDisplay$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS)
		.withLatestFrom(this.store$.select(mapStateSelector))
		.filter(([action, mapState]: [DisplayOverlaySuccessAction, IMapState]) => mapState.pendingOverlays.includes(action.payload.overlay.id))
		.map(([action, mapState]: [DisplayOverlaySuccessAction, IMapState]) => {
			return new RemovePendingOverlayAction(action.payload.overlay.id);
		});

	/**
	 * @type Effect
	 * @name onDisplayOverlayFromStore$
	 * @ofType DisplayOverlayFromStoreAction
	 * @dependencies overlays, map
	 * @action DisplayOverlayAction
	 */
	@Effect()
	onDisplayOverlayFromStore$: Observable<DisplayOverlayAction> = this.actions$
		.ofType(OverlaysActionTypes.DISPLAY_OVERLAY_FROM_STORE)
		.withLatestFrom(this.store$.select(overlaysStateSelector), this.store$.select(mapStateSelector))
		.map(([{ payload }, { overlays }, { activeMapId }]: [DisplayOverlayFromStoreAction, IOverlaysState, IMapState]) => {
			const mapId = payload.mapId || activeMapId;
			const overlay = overlays.get(payload.id);
			return new DisplayOverlayAction({ overlay, mapId });
		});

	/**
	 * @type Effect
	 * @name setHoveredOverlay$
	 * @action SetHoveredOverlayAction
	 */

	private getOverlayFromDropMarkup = map(([markupMap, overlays]: [ExtendMap<MarkUpClass, MarkUpData>, Map<any, any>]) =>
		overlays.get(markupMap && markupMap.get(MarkUpClass.hover).overlaysIds[0])
	);
	private getCommunicatorForActiveMap = map(([overlay, activeMapId]: [Overlay, string]) => [overlay, this.imageryCommunicatorService.provide(activeMapId)]);
	private getPositionFromCommunicator = mergeMap(([overlay, communicator]: [Overlay, CommunicatorEntity]) => {
		if (!communicator) {
			return Observable.of([overlay, null]);
		}
		return communicator.getPosition().map((position) => [overlay, position]);
	});
	private getOverlayWithNewThumbnail = mergeMap(([overlay, position]: [Overlay, CaseMapPosition]) => {
		if (!overlay) {
			return [overlay];
		}
		const sourceProvider = this.getSourceProvider(overlay.sourceType);
		return (<any>sourceProvider).getThumbnailUrl(overlay, position).map(thumbnailUrl => ({
			...overlay,
			thumbnailUrl
		}));
	});
	private getHoveredOverlayAction = map((overlay: Overlay) => new SetHoveredOverlayAction(overlay));

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
	setSpecialObjectsFromContextEntities$: Observable<any> = this.store$.select(selectContextEntities)
		.filter((contextEntities: IContextEntity[]) => Boolean(contextEntities))
		.map((contextEntities: IContextEntity[]): Action => {
			const specialObjects = contextEntities.map(contextEntity => ({
				id: contextEntity.id,
				date: contextEntity.date,
				shape: 'star'
			} as OverlaySpecialObject));
			return new SetSpecialObjectsActionStore(specialObjects);
		});

	getSourceProvider(sType) {
		return this.baseSourceProviders.find(({ constructor }) => sType === (<BaseMapSourceProviderConstructor>constructor).sourceType);
	}

	constructor(public actions$: Actions,
				public store$: Store<IAppState>,
				public overlaysService: OverlaysService,
				@Inject(BaseMapSourceProvider) public baseSourceProviders: BaseMapSourceProvider[],
				public imageryCommunicatorService: ImageryCommunicatorService) {
	}

}
