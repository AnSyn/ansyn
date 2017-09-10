import { Injectable } from '@angular/core';
import { Effect, Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { IAppState } from '../';
import {
	ToolsActionsTypes, SetActiveCenter, DisableImageProcessing, EnableImageProcessing,
	SetAutoImageProcessing, SetAutoImageProcessingSuccess
} from '@ansyn/menu-items/tools';
import { ICasesState, CasesActionTypes, SelectCaseByIdAction, UpdateCaseAction } from '@ansyn/menu-items/cases';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import 'rxjs/add/operator/withLatestFrom';
import { get as _get, isNil as _isNil } from 'lodash';
import { CommunicatorEntity } from '@ansyn/imagery/communicator-service/communicator.entity';
import { SetPinLocationModeAction } from '@ansyn/menu-items/tools/actions/tools.actions';
import { MapActionTypes, SetMapAutoImageProcessing, BackToWorldAction, ActiveMapChangedAction } from '@ansyn/map-facade';
import { OverlaysActionTypes, DisplayOverlaySuccessAction } from '@ansyn/overlays';
import { cloneDeep } from 'lodash';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { Case } from '@ansyn/core/models/case.model';
import { SetActiveOverlaysFootprintModeAction } from '@ansyn/menu-items/tools/actions/tools.actions';
import { AnnotationVisualizerAgentAction } from '../../packages/menu-items/tools/actions/tools.actions';

@Injectable()
export class ToolsAppEffects {


	@Effect()
	onActiveMapChanges$: Observable<ActiveMapChangedAction> = this.actions$
		.ofType(MapActionTypes.ACTIVE_MAP_CHANGED)
		.withLatestFrom(this.store$.select('cases'))
		.mergeMap(([action, casesState]: [ActiveMapChangedAction, ICasesState]) => {
			const mapId = casesState.selected_case.state.maps.active_map_id;
			const active_map = casesState.selected_case.state.maps.data.find((map) => map.id === mapId);

			if (active_map.data.overlay == null) {
				return [new DisableImageProcessing()];
			} else {
				return [
					new EnableImageProcessing(),
					new SetAutoImageProcessingSuccess(active_map.data.isAutoImageProcessingActive)
				];
			}
		});

	@Effect()
	onActiveMapChangesSetOverlaysFootprintMode$: Observable<SetActiveOverlaysFootprintModeAction> = this.actions$
		.ofType(MapActionTypes.ACTIVE_MAP_CHANGED)
		.withLatestFrom(this.store$.select('cases').pluck('selected_case'))
		.map(([action, selected_case]) => CasesService.activeMap(selected_case))
		.mergeMap(activeMap =>
			[
				new SetActiveOverlaysFootprintModeAction(activeMap.data.overlayDisplayMode),
				new AnnotationVisualizerAgentAction({
					action: "removeLayer",
					maps: "all"
				}),
				new AnnotationVisualizerAgentAction({
					action: "show",
					maps: "all"
				})
			]
		)

	@Effect()
	onShowOverlayFootprint$: Observable<any> = this.actions$
		.ofType(ToolsActionsTypes.SHOW_OVERLAYS_FOOTPRINT)
		.map((action) => new SetActiveOverlaysFootprintModeAction(action.payload));

	@Effect()
	onDisplayOverlaySuccess$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS)
		.withLatestFrom(this.store$.select('cases'), (action: DisplayOverlaySuccessAction, casesState: ICasesState) => {
			const mapId = casesState.selected_case.state.maps.active_map_id;
			const active_map = casesState.selected_case.state.maps.data.find((map) => map.id === mapId);
			return [mapId, active_map.data.isAutoImageProcessingActive];
		})
		.mergeMap(([mapId, isAutoImageProcessingActive]: [string, boolean]) => {
			return [
				new EnableImageProcessing(),
				new SetMapAutoImageProcessing({ mapId: mapId, toggle_value: isAutoImageProcessingActive }),
				new SetAutoImageProcessingSuccess(isAutoImageProcessingActive)
			];
		});

	@Effect()
	backToWorldView$: Observable<any> = this.actions$
		.ofType(MapActionTypes.BACK_TO_WORLD)
		.map(() => new DisableImageProcessing());


	@Effect()
	onSelectCaseById$: Observable<DisableImageProcessing> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE_BY_ID)
		.map(() => new DisableImageProcessing());

	@Effect()
	toggleAutoImageProcessing$: Observable<any> = this.actions$
		.ofType(ToolsActionsTypes.SET_AUTO_IMAGE_PROCESSING)
		.withLatestFrom(this.store$.select('cases'), (action: SetAutoImageProcessing, casesState: ICasesState) => {
			const mapId = casesState.selected_case.state.maps.active_map_id;
			return [action, casesState, mapId];
		})
		.mergeMap(([action, caseState, mapId]: [SetAutoImageProcessing, ICasesState, string]) => {
			let shouldAutoImageProcessing;
			const updatedCase = cloneDeep(caseState.selected_case);
			updatedCase.state.maps.data.forEach(
				(map) => {
					if (map.id === mapId) {
						map.data.isAutoImageProcessingActive = !map.data.isAutoImageProcessingActive;
						shouldAutoImageProcessing = map.data.isAutoImageProcessingActive;
					}
				});

			return [
				new SetMapAutoImageProcessing({ mapId: mapId, toggle_value: shouldAutoImageProcessing }),
				new UpdateCaseAction(updatedCase),
				new SetAutoImageProcessingSuccess(shouldAutoImageProcessing)
			];
		});

	@Effect()
	getActiveCenter$: Observable<SetActiveCenter> = this.actions$
		.ofType(ToolsActionsTypes.PULL_ACTIVE_CENTER)
		.withLatestFrom(this.store$.select('cases'), (action, cases: ICasesState) => {
			const activeMapId: string = <string>_get(cases.selected_case, "state.maps.active_map_id");
			return this.imageryCommunicatorService.provide(activeMapId);
		})
		.filter(communicator => !_isNil(communicator))
		.map((communicator: CommunicatorEntity) => {
			const activeMapCenter = communicator.getCenter();
			return new SetActiveCenter(activeMapCenter.coordinates);
		});


	@Effect({ dispatch: false })
	updatePinLocationAction$: Observable<void> = this.actions$
		.ofType(ToolsActionsTypes.SET_PIN_LOCATION_MODE)
		.map((action: SetPinLocationModeAction) => {
			this.imageryCommunicatorService.communicatorsAsArray().forEach((communicator) => {
				if (action.payload) {
					communicator.createMapSingleClickEvent();
				} else {
					communicator.removeSingleClickEvent();
				}
			});
		});

	@Effect()
	onGoTo$: Observable<SetActiveCenter> = this.actions$
		.ofType(ToolsActionsTypes.GO_TO)
		.withLatestFrom(this.store$.select('cases'), (action, cases: ICasesState): any => {
			const activeMapId: string = <any>_get(cases.selected_case, "state.maps.active_map_id");
			return { action, communicator: this.imageryCommunicatorService.provide(activeMapId) };
		})
		.filter(({ action, communicator }) => !_isNil(communicator))
		.map(({ action, communicator }) => {
			const center: GeoJSON.Point = {
				type: 'Point',
				coordinates: action.payload
			};
			communicator.setCenter(center);
			return new SetActiveCenter(action.payload);
		});


	constructor(private actions$: Actions, private store$: Store<IAppState>, private imageryCommunicatorService: ImageryCommunicatorService) { }
}
