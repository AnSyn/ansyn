import { toolsFlags, toolsStateSelector } from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { Actions, Effect } from '@ngrx/effects';
import { differenceWith } from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { IAppState } from '../../app.effects.module';
import { Store } from '@ngrx/store';
import { CaseMapState } from '@ansyn/core/models/case.model';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { casesStateSelector, ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import {
	SetAnnotationMode,
	SetMeasureDistanceToolState, SetPinLocationModeAction,
	ShowOverlaysFootprintAction,
	StartMouseShadow,
	StopMouseShadow,
	ToolsActionsTypes
} from '@ansyn/menu-items/tools/actions/tools.actions';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { ContextEntityVisualizer } from '../../../app-providers/app-visualizers/context-entity.visualizer';
import {
	DrawOverlaysOnMapTriggerAction,
	MapActionTypes,
	SetMapsDataActionStore
} from '@ansyn/map-facade/actions/map.actions';
import { DisplayOverlaySuccessAction, OverlaysActionTypes } from '@ansyn/overlays/actions/overlays.actions';
import { BackToWorldView, ClearActiveInteractionsAction, CoreActionTypes } from '@ansyn/core/actions/core.actions';
import { statusBarFlagsItemsEnum } from '@ansyn/status-bar/models/status-bar-flag-items.model';
import { UpdateStatusFlagsAction } from '@ansyn/status-bar/actions/status-bar.actions';

@Injectable()
export class VisualizersAppEffects {
	/**
	 * @type Effect
	 * @name updateCaseFromTools$
	 * @ofType ShowOverlaysFootprintAction
	 * @dependencies map
	 * @action SetMapsDataActionStore, DrawOverlaysOnMapTriggerAction
	 */
	@Effect()
	updateCaseFromTools$: Observable<any> = this.actions$
		.ofType<ShowOverlaysFootprintAction>(ToolsActionsTypes.SHOW_OVERLAYS_FOOTPRINT)
		.withLatestFrom(this.store$.select(mapStateSelector))
		.mergeMap(([action, mapState]: [ShowOverlaysFootprintAction, IMapState]) => {
			const mapsList = [...mapState.mapsList];
			const activeMap = MapFacadeService.activeMap(mapState);
			activeMap.data.overlayDisplayMode = action.payload;
			return [
				new SetMapsDataActionStore({ mapsList }),
				new DrawOverlaysOnMapTriggerAction()
			];
		});

	/**
	 * @type Effect
	 * @name shouldDrawOverlaysOnMap$
	 * @ofType SetFilteredOverlaysAction, MapInstanceChangedAction
	 * @action DrawOverlaysOnMapTriggerAction
	 */
	@Effect()
	shouldDrawOverlaysOnMap$: Observable<DrawOverlaysOnMapTriggerAction> = this.actions$
		.ofType(OverlaysActionTypes.SET_FILTERED_OVERLAYS, MapActionTypes.MAP_INSTANCE_CHANGED_ACTION)
		.map((action) => new DrawOverlaysOnMapTriggerAction());

	/**
	 * @type Effect
	 * @name displayEntityTimeFromOverlay$
	 * @ofType DisplayOverlaySuccessAction, BackToWorldAction
	 * @dependencies map, cases
	 * @filter Only when context
	 */
	@Effect({ dispatch: false })
	displayEntityTimeFromOverlay$: Observable<any> = this.actions$
		.ofType<DisplayOverlaySuccessAction | BackToWorldView>(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS, CoreActionTypes.BACK_TO_WORLD_VIEW)
		.withLatestFrom(this.store$.select(mapStateSelector), this.store$.select(casesStateSelector))
		.filter(([action, mapState, casesState]: [DisplayOverlaySuccessAction | BackToWorldView, IMapState, ICasesState]) => Boolean(casesState.selectedCase.state.contextEntities) && casesState.selectedCase.state.contextEntities.length > 0)
		.do(([action, mapState, casesState]: [DisplayOverlaySuccessAction | BackToWorldView, IMapState, ICasesState]) => {
			const mapId = action.payload.mapId || mapState.activeMapId;
			const selectedMap: CaseMapState = MapFacadeService.mapById(mapState.mapsList, mapId);
			const communicatorHandler = this.imageryCommunicatorService.provide(mapId);

			const vis = communicatorHandler.getPlugin<ContextEntityVisualizer>(ContextEntityVisualizer);
			vis.setReferenceDate(action instanceof DisplayOverlaySuccessAction ? selectedMap.data.overlay.date : null);
		});

	/**
	 * @type Effect
	 * @name clearActiveInteractions$
	 * @ofType ClearActiveInteractionsAction
	 * @action SetMeasureDistanceToolState?, SetAnnotationMode?, UpdateStatusFlagsAction?, SetPinLocationModeAction?
	 */
	@Effect()
	clearActiveInteractions$ = this.actions$
		.ofType<ClearActiveInteractionsAction>(CoreActionTypes.CLEAR_ACTIVE_INTERACTIONS)
		.mergeMap(action => {
			// reset the following interactions: Measure Distance, Annotation, Pinpoint search, Pin location
			let clearActions = [
				new SetMeasureDistanceToolState(false),
				new SetAnnotationMode(),
				new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.geoFilterSearch, value: false }),
				new SetPinLocationModeAction(false)
			];
			// return defaultClearActions without skipClearFor
			if (action.payload && action.payload.skipClearFor) {
				clearActions = differenceWith(clearActions, action.payload.skipClearFor,
					(act, actType) => act instanceof actType);
			}
			return clearActions;
		});

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
	}

	getPlugin<T>(mapId, visualizerType): T {
		const communicator = this.imageryCommunicatorService.provide(mapId);
		return communicator ? communicator.getPlugin<T>(visualizerType) : null;
	}

}
