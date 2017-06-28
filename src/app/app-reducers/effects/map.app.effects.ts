import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { OverlaysActionTypes } from '@ansyn/overlays/actions/overlays.actions';
import { Overlay } from '@ansyn/overlays/models/overlay.model';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { LayersActionTypes, SelectLayerAction, UnselectLayerAction } from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { IAppState } from '../';
import { BaseSourceProvider } from '@ansyn/imagery';
import { Case, ICasesState, CasesService, UpdateCaseAction } from '@ansyn/menu-items/cases';
import { MapActionTypes, PositionChangedAction, StartMapShadowAction ,StopMapShadowAction ,CompositeMapShadowAction, ActiveMapChangedAction } from '@ansyn/map-facade';
import { isEmpty,cloneDeep } from 'lodash';
import { ToolsActionsTypes } from '@ansyn/menu-items/tools';
import '@ansyn/core/utils/clone-deep';
import { TypeContainerService } from "@ansyn/type-container";
import * as turf from '@turf/turf';
import 'rxjs/add/operator/withLatestFrom';
import '@ansyn/core/utils/clone-deep';
import { OverlaysService,DisplayOverlayAction } from "@ansyn/overlays";
import { IStatusBarState } from "@ansyn/status-bar/reducers/status-bar.reducer";
import { UpdateStatusFlagsAction,statusBarFlagsItems } from "@ansyn/status-bar";
import { LoadOverlaysAction } from '@ansyn/overlays/actions/overlays.actions';
import { BackToWorldAction } from '@ansyn/map-facade/actions/map.actions';
import { OverlaysMarkupAction } from '@ansyn//overlays/actions/overlays.actions';


@Injectable()
export class MapAppEffects {

	@Effect()
	onMapSingleClick$: Observable<any> = this.actions$
	.ofType(MapActionTypes.MAP_SINGLE_CLICK)
	.withLatestFrom(this.store$.select('cases'), this.store$.select('status_bar') , (action:UpdateStatusFlagsAction,caseState:ICasesState ,statusBarState:IStatusBarState) => [action,caseState,statusBarState])
		.filter(([action,caseState,statusBarState]:[UpdateStatusFlagsAction,ICasesState ,IStatusBarState]): any => statusBarState.flags.get(statusBarFlagsItems.pinPointSearch))
		.mergeMap(([action,caseState,statusBarState]:[UpdateStatusFlagsAction,ICasesState ,IStatusBarState]) => {

		//create the region
	 	const region = this.overlaysService.getPolygonByPoint(action.payload.lonLat).geometry;

		//draw on all maps
		this.communicator.communicatorsAsArray().forEach( communicator => {
			if(statusBarState.flags.get(statusBarFlagsItems.pinPointIndicator)) {
				communicator.addPinPointIndicator(action.payload.lonLat);
			}
			//this is for the others communicators
			communicator.removeSingleClickEvent();
		});

		//draw the point on the map // all maps
		const selectedCase = {...caseState.selected_case, state: {...caseState.selected_case.state, region:region}};

		return [
			//disable the pinpoint search
			new UpdateStatusFlagsAction({ key : statusBarFlagsItems.pinPointSearch, value: false}),
			//update case
			new UpdateCaseAction(selectedCase),
			//load overlays
			new LoadOverlaysAction({
				to:selectedCase.state.time.to,
				from:selectedCase.state.time.from,
				polygon:selectedCase.state.region,
				caseId: selectedCase.id
			})
		];
	});

	@Effect()
	onStartMapShadow$: Observable<StartMapShadowAction> = this.actions$
		.ofType(ToolsActionsTypes.START_MOUSE_SHADOW)
		.map(() => new StartMapShadowAction());

	@Effect()
	onEndMapShadow$: Observable<StopMapShadowAction> = this.actions$
		.ofType(ToolsActionsTypes.STOP_MOUSE_SHADOW)
		.map(() => new StopMapShadowAction());

	@Effect({ dispatch: false })
	selectOverlay$: Observable<Action> = this.actions$
		.ofType(OverlaysActionTypes.DISPLAY_OVERLAY)
		.withLatestFrom(this.store$, (action: DisplayOverlayAction, store: IAppState) => {
			const overlay = store.overlays.overlays.get(action.payload.id);
			const map_id = action.payload.map_id ? action.payload.map_id : store.cases.selected_case.state.maps.active_map_id;
			return [overlay, map_id];
		})
		.switchMap( ([overlay, map_id]:[Overlay, string]) => {
			const footprintFeature: GeoJSON.Feature<any> = {
				"type": 'Feature',
				"properties": {},
				"geometry": overlay.footprint
			};
			const center = turf.center(footprintFeature);
			const bbox = turf.bbox(footprintFeature);
			const bboxPolygon = turf.bboxPolygon(bbox);
			const extent = {topLeft: bboxPolygon.geometry.coordinates[0][0], topRight: bboxPolygon.geometry.coordinates[0][1], bottomLeft: bboxPolygon.geometry.coordinates[0][2], bottomRight:bboxPolygon.geometry.coordinates[0][3]};
			const mapType = this.communicator.provide(map_id).ActiveMap.mapType;
			const sourceLoader = this.typeContainerService.resolve(BaseSourceProvider,[mapType, overlay.sourceType].join(','));
			sourceLoader.createAsync(overlay).then((layer)=> {
				this.communicator.provide(map_id).setLayer(layer, extent);
				this.communicator.provide(map_id).setCenter(center.geometry);
			});

			return Observable.empty();
		});

	@Effect({ dispatch: false })
	addVectorLayer$: Observable<void> = this.actions$
		.ofType(LayersActionTypes.SELECT_LAYER)
		.withLatestFrom(this.store$.select("cases"))
		.map(([action, state]: [SelectLayerAction, ICasesState]) => {
			return [action, state.selected_case.state.maps.active_map_id];
		})
		.map(([action, active_map_id]: [SelectLayerAction, string]) => {
			const imagery = this.communicator.provide(active_map_id);
			imagery.addVectorLayer(action.payload);
		}).share();

	@Effect({ dispatch: false })
	removeVectorLayer$: Observable<void> = this.actions$
		.ofType(LayersActionTypes.UNSELECT_LAYER)
		.withLatestFrom(this.store$.select('cases'))
		.map(([action, state]: [UnselectLayerAction, ICasesState])=> [action, state.selected_case.state.maps.active_map_id])
		.map(([action, active_map_id]: [UnselectLayerAction, string]) => {
			let imagery = this.communicator.provide(active_map_id);
			imagery.removeVectorLayer(action.payload);
		}).share();

	@Effect()
	positionChanged$: Observable<UpdateCaseAction> = this.actions$
		.ofType(MapActionTypes.POSITION_CHANGED)
		.withLatestFrom(this.store$.select('cases'))
		.filter(([action, state]: [PositionChangedAction, ICasesState]) => {
			const selected_map_index = state.selected_case.state.maps.data.findIndex((map) => map.id === action.payload.id);
			return !isEmpty(state.selected_case) && selected_map_index !== -1;
		})
		.cloneDeep()
		.map( ([action, state]: [PositionChangedAction, ICasesState]) => {
			const selected_case: Case = state.selected_case;
			const selected_map_index = selected_case.state.maps.data.findIndex((map) => map.id === action.payload.id);
			const selected_map = selected_case.state.maps.data[selected_map_index];
			selected_map.data.position = action.payload.position;
			selected_case.state.maps.data[selected_map_index] = selected_map;

			return new UpdateCaseAction(selected_case);
		});

	@Effect()
	onCommunicatorChange$: Observable<any> = this.actions$
		.ofType(MapActionTypes.ADD_MAP_INSTANCE,MapActionTypes.REMOVE_MAP_INSTACNE)
		.withLatestFrom(this.store$.select("cases"))
		.filter(([action, caseState]:[Action,ICasesState]) => {
			const communicatorsIds = action.payload.communicatorsIds;
			return communicatorsIds.length > 1 && communicatorsIds.length === caseState.selected_case.state.maps.data.length;
		})
		.map(() => new CompositeMapShadowAction());

	@Effect({dispatch:false})
	onAddCommunicatorShowPinPoint$: Observable<any> = this.actions$
		.ofType(MapActionTypes.ADD_MAP_INSTANCE)
		.withLatestFrom(this.store$.select("cases"),this.store$.select("status_bar"))
		.filter(([action,caseState,statusBarState]:[any,any,any]) => statusBarState.flags.get(statusBarFlagsItems.pinPointIndicator) || statusBarState.flags.get(statusBarFlagsItems.pinPointSearch))
		.map(([action,caseState,statusBarState]:[any,any,any]) => {
			const communicatorHandler = this.communicator.provide(action.payload.currentCommunicatorId);

			if(statusBarState.flags.get(statusBarFlagsItems.pinPointIndicator)) {
				const point = this.overlaysService.getPointByPolygon(caseState.selected_case.state.region);
				communicatorHandler.addPinPointIndicator(point.coordinates);
			}

			if(statusBarState.flags.get(statusBarFlagsItems.pinPointSearch)) {
				communicatorHandler.createMapSingleClickEvent();
			}

		} );

	@Effect()
	onActiveMapChanges$: Observable<Action> = this.actions$
		.ofType(MapActionTypes.ACTIVE_MAP_CHANGED)
		.withLatestFrom(this.store$.select("cases"))
		.filter(([action, caseState]:[ActiveMapChangedAction,ICasesState]): any =>
			caseState.selected_case.state.maps.active_map_id !== action.payload
		)
		.mergeMap(([action,caseState]:[ActiveMapChangedAction,ICasesState]) => {
			const updatedCase = cloneDeep(caseState.selected_case);
			updatedCase.state.maps.active_map_id = action.payload;

			return [
				new UpdateCaseAction(updatedCase),
				new OverlaysMarkupAction(this.casesService.getOverlaysMarkup(updatedCase))
			];

		});

	/// Back To world
	@Effect({dispatch: false})
	backToWorld$ = this.actions$
		.ofType(MapActionTypes.BACK_TO_WORLD)
		.withLatestFrom(this.store$.select('cases'), (action: BackToWorldAction, state: ICasesState) => {
			const maps = state.selected_case.state.maps;
			let mapId = action.payload.mapId ? action.payload.mapId : maps.active_map_id;
			const comm = this.communicator.provide(mapId);
			comm.loadInitialMapSource();
		});

	constructor(
		private actions$: Actions,
		private casesService: CasesService,
		private store$: Store<IAppState>,
		private communicator: ImageryCommunicatorService,
		private typeContainerService: TypeContainerService,
		private overlaysService: OverlaysService
	) { }
}
