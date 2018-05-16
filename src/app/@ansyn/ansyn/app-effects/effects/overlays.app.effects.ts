import { Actions, Effect } from '@ngrx/effects';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {
	DisplayMultipleOverlaysFromStoreAction,
	DisplayOverlayAction,
	DisplayOverlayFromStoreAction,
	DisplayOverlaySuccessAction,
	OverlaysActionTypes,
	SetHoveredOverlayAction
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
import { Overlay } from '@ansyn/core/models/overlay.model';
import {
	RemovePendingOverlayAction,
	SetPendingOverlaysAction,
	SynchronizeMapsAction
} from '@ansyn/map-facade/actions/map.actions';
import { IMapState, mapStateSelector, selectActiveMapId } from '@ansyn/map-facade/reducers/map.reducer';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { LayoutKey, layoutOptions } from '@ansyn/core/models/layout-options.model';
import { CoreActionTypes, SetLayoutAction } from '@ansyn/core/actions/core.actions';
import { ExtendMap } from '@ansyn/overlays/reducers/extendedMap.class';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { CaseMapPosition } from '@ansyn/core/models/case-map-position.model';
import { CommunicatorEntity } from '@ansyn/imagery/communicator-service/communicator.entity';
import { catchError } from 'rxjs/operators';
import { MultipleOverlaysSource } from '@ansyn/ansyn/app-providers/overlay-source-providers/multiple-source-provider';
import { BaseOverlaySourceProvider } from '@ansyn/overlays/models/base-overlay-source-provider.model';

@Injectable()
export class OverlaysAppEffects {


	/**
	 * @type Effect
	 * @name initTimelineState$
	 * @ofType LoadOverlaysSuccessAction
	 * @filter There is an imagery count before or after
	 * @dependencies overlays
	 */
	@Effect({ dispatch: false })
	initTimelineState$ = this.actions$
		.ofType(OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS)
		.filter(() => this.casesService.contextValues.imageryCountBefore !== -1 || this.casesService.contextValues.imageryCountAfter !== -1)
		.do(() => {
			this.casesService.contextValues.imageryCountBefore = -1;
			this.casesService.contextValues.imageryCountAfter = -1;
		});

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
		.ofType(OverlaysActionTypes.SET_FILTERED_OVERLAYS)
		.filter(action => this.casesService.contextValues.defaultOverlay === 'latest')
		.withLatestFrom(this.store$.select(overlaysStateSelector), (action, overlays: IOverlaysState) => {
			return overlays.filteredOverlays;
		})
		.filter((displayedOverlays) => Boolean(displayedOverlays) && displayedOverlays.length > 0)
		.map((displayedOverlays: any[]) => {
			const lastOverlayId = displayedOverlays[displayedOverlays.length - 1];
			this.casesService.contextValues.defaultOverlay = '';
			return new DisplayOverlayFromStoreAction({ id: lastOverlayId });
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
		.ofType(OverlaysActionTypes.SET_FILTERED_OVERLAYS)
		.filter(action => this.casesService.contextValues.defaultOverlay === 'nearest')
		.withLatestFrom(this.store$.select(overlaysStateSelector), (action, overlays: IOverlaysState) => {
			return [overlays.filteredOverlays, overlays.overlays];
		})
		.filter(([filteredOverlays, overlays]: [string[], Map<string, Overlay>]) => Boolean(filteredOverlays) && filteredOverlays.length > 0)
		.map(([filteredOverlays, overlays]: [string[], Map<string, Overlay>]) => {

			const overlaysBefore = [...filteredOverlays].reverse().find(overlay => overlays.get(overlay).photoTime < this.casesService.contextValues.time);

			const overlaysAfter = filteredOverlays.find(overlay => overlays.get(overlay).photoTime > this.casesService.contextValues.time);

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
	@Effect()
	setHoveredOverlay$: Observable<any> = this.store$.select(selectDropMarkup)
		// Get the related overlay
		.withLatestFrom(this.store$.select(selectOverlaysMap))
		.map(([markupMap, overlays]: [ExtendMap<MarkUpClass, MarkUpData>, Map<any, any>]) =>
			overlays.get(markupMap && markupMap.get(MarkUpClass.hover).overlaysIds[0])
		)
		// Get also active map position, from communicator
		.withLatestFrom(this.store$.select(selectActiveMapId))
		.map(([overlay, activeMapId]: [Overlay, string]) => [overlay, this.imageryCommunicatorService.provide(activeMapId)])
		.mergeMap(([overlay, communicator]: [Overlay, CommunicatorEntity]) => {
			if (!communicator) {
				return Observable.of([overlay, null])
			}
			return communicator.getPosition().map((position) => [overlay, position])
		})
		// Get thumbnailUrl per source type, map type, and map position
		.mergeMap(([overlay, position]: [Overlay, CaseMapPosition]) => {
			if (!overlay) {
				return [overlay];
			}
			const overlaySourceProvider = this.getOverlaySourceProvider(overlay.sourceType);
			return overlaySourceProvider.getThumbnailUrl(overlay, position).map(thumbnailUrl => ({ ...overlay, thumbnailUrl }));
		})
		// Return an action with the updated overlay as payload
		.map((overlay: Overlay) => new SetHoveredOverlayAction(overlay))
		// Catch errors
		.pipe(
			catchError(err => {
				console.error(err);
				return Observable.of(err);
			})
		)
	;

	getOverlaySourceProvider(sType) {
		return this.multipleOverlaysSource.find(({ sourceType }) => sType === sourceType);
	}

	constructor(public actions$: Actions,
				public store$: Store<IAppState>,
				public casesService: CasesService,
				public overlaysService: OverlaysService,
				@Inject(MultipleOverlaysSource) public multipleOverlaysSource: BaseOverlaySourceProvider[],
				public imageryCommunicatorService: ImageryCommunicatorService
	) {
	}

}
