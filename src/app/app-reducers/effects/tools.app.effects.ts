import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { IAppState } from '../';
import {
	DisableImageProcessing,
	EnableImageProcessing,
	SetActiveCenter,
	SetAutoImageProcessing,
	SetAutoImageProcessingSuccess,
	ToolsActionsTypes
} from '@ansyn/menu-items/tools';
import { CasesActionTypes, ICasesState } from '@ansyn/menu-items/cases';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import 'rxjs/add/operator/withLatestFrom';
import { get as _get, isNil as _isNil } from 'lodash';
import { CommunicatorEntity } from '@ansyn/imagery/communicator-service/communicator.entity';
import {
	AnnotationVisualizerAgentAction,
	SetActiveOverlaysFootprintModeAction,
	SetPinLocationModeAction
} from '@ansyn/menu-items/tools/actions/tools.actions';
import { ActiveMapChangedAction, MapActionTypes, SetMapAutoImageProcessing } from '@ansyn/map-facade';
import { DisplayOverlaySuccessAction, OverlaysActionTypes } from '@ansyn/overlays';
import { IMapState } from '@ansyn/map-facade/reducers/map.reducer';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { SetMapsDataActionStore } from '@ansyn/map-facade/actions/map.actions';

@Injectable()
export class ToolsAppEffects {


	@Effect()
	onActiveMapChanges$: Observable<ActiveMapChangedAction | DisableImageProcessing | SetAutoImageProcessingSuccess> = this.actions$
		.ofType(MapActionTypes.ACTIVE_MAP_CHANGED)
		.withLatestFrom(this.store$.select('map'), (action, mapState: IMapState) => mapState)
		.map(MapFacadeService.activeMap)
		.filter(activeMap => !_isNil(activeMap))
		.mergeMap((activeMap) => {
			if (_isNil(activeMap.data.overlay)) {
				return [new DisableImageProcessing()];
			} else {
				return [
					new EnableImageProcessing(),
					new SetAutoImageProcessingSuccess(activeMap.data.isAutoImageProcessingActive)
				];
			}
		});

	@Effect()
	onActiveMapChangesSetOverlaysFootprintMode$: Observable<SetActiveOverlaysFootprintModeAction> = this.actions$
		.ofType(MapActionTypes.ACTIVE_MAP_CHANGED)
		.withLatestFrom(this.store$.select('map'), (action, mapState: IMapState) => mapState)
		.map(MapFacadeService.activeMap)
		.mergeMap(activeMap =>
			[
				new SetActiveOverlaysFootprintModeAction(activeMap.data.overlayDisplayMode),

				new AnnotationVisualizerAgentAction({
					action: 'removeLayer',
					maps: 'all'
				}),

				new AnnotationVisualizerAgentAction({
					action: 'show',
					maps: 'all'
				})
			]
		);

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
		.withLatestFrom(this.store$.select('map'), (action: SetAutoImageProcessing, mapsState: IMapState) => {
			return [action, mapsState];
		})
		.mergeMap(([action, mapsState]: [SetAutoImageProcessing, IMapState]) => {
			const activeMapId = mapsState.activeMapId;
			let shouldAutoImageProcessing;
			const updatedMapsList = [...mapsState.mapsList];
			updatedMapsList.forEach(
				(map) => {
					if (map.id === activeMapId) {
						map.data.isAutoImageProcessingActive = !map.data.isAutoImageProcessingActive;
						shouldAutoImageProcessing = map.data.isAutoImageProcessingActive;
					}
				});

			return [
				new SetMapAutoImageProcessing({ mapId: activeMapId, toggle_value: shouldAutoImageProcessing }),
				new SetMapsDataActionStore({ mapsList: updatedMapsList }),
				new SetAutoImageProcessingSuccess(shouldAutoImageProcessing)
			];
		});

	@Effect()
	getActiveCenter$: Observable<SetActiveCenter> = this.actions$
		.ofType(ToolsActionsTypes.PULL_ACTIVE_CENTER)
		.withLatestFrom(this.store$.select('cases'), (action, cases: ICasesState) => {
			const activeMapId: string = <string>_get(cases.selected_case, 'state.maps.active_map_id');
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
			const activeMapId: string = <any>_get(cases.selected_case, 'state.maps.active_map_id');
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


	constructor(private actions$: Actions, private store$: Store<IAppState>, private imageryCommunicatorService: ImageryCommunicatorService) {
	}
}
