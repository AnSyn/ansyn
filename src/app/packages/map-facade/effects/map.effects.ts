import { Injectable } from '@angular/core';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { MapFacadeService } from '../services/map-facade.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import { ActiveMapChangedAction, BackToWorldAction, MapActionTypes, SetMapsDataActionStore } from '../actions/map.actions';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { isNil as _isNil, cloneDeep as _cloneDeep } from 'lodash';
import 'rxjs/add/operator/share';
import { Store } from '@ngrx/store';
import { IMapState } from '../reducers/map.reducer';
import { CaseMapState } from '@ansyn/core/models/case.model';


@Injectable()
export class MapEffects {

	@Effect({ dispatch: false })
	onUpdateSize$: Observable<void> = this.actions$
		.ofType(MapActionTypes.UPDATE_MAP_SIZE)
		.map(() => {
			//@todo move this to service we will need it pass function name and send it to all the maps
			Object.keys(this.communicatorsService.communicators).forEach((imagery_id: string) => {
				this.communicatorsService.provide(imagery_id).updateSize();
			});
		});


	@Effect({ dispatch: false })
	onCommunicatorChange$: Observable<any> = this.actions$
		.ofType(MapActionTypes.ADD_MAP_INSTANCE, MapActionTypes.REMOVE_MAP_INSTACNE, MapActionTypes.MAP_INSTANCE_CHANGED_ACTION)
		.map(() => {
			this.mapFacadeService.initEmitters();
		});


	@Effect({ dispatch: false })
	onStopMapShadowMouse$: Observable<any> = this.actions$
		.ofType(MapActionTypes.STOP_MAP_SHADOW_ACTIONS)
		.share();

	@Effect({ dispatch: false })
	onStartMapShadowMouse$: Observable<any> = this.actions$
		.ofType(MapActionTypes.START_MAP_SHADOW_ACTIONS)
		.share();

	@Effect({ dispatch: false })
	onComposeMapShadowMouse$: Observable<any> = this.actions$
		.ofType(MapActionTypes.COMPOSITE_MAP_SHADOW_ACTION)
		.share();

	@Effect({ dispatch: false })
	onToggleImageProcessing$: Observable<any> = this.actions$
		.ofType(MapActionTypes.SET_MAP_AUTO_IMAGE_PROCESSING)
		.map(toPayload)
		.map(({ mapId, toggle_value }) => [this.communicatorsService.provide(mapId), toggle_value])
		.filter(([comm]) => !_isNil(comm))
		.do(([comm, toggle_value]) => {
			comm.setAutoImageProcessing(toggle_value);
		});

	@Effect({ dispatch: false })
	onContextMenuShow$: Observable<any> = this.actions$
		.ofType(MapActionTypes.CONTEXT_MENU.SHOW)
		.share();

	@Effect()
	onLayoutsChange$: Observable<SetMapsDataActionStore> = this.actions$
		.ofType(MapActionTypes.SET_LAYOUT)
		.withLatestFrom(this.store$.select('map').pluck<any, any>('mapsData'), this.store$.select('map').pluck('activeMapId'))
		.filter(([{payload}, mapsData]) => payload.maps_count !== mapsData.length && mapsData.length > 0)
		.map(([{payload}, mapsData, activeMapId]) => MapFacadeService.setMapsDataChanges(mapsData, activeMapId, payload))
		.mergeMap(
			({ newMapsData, newActiveMapId }) => {
				if (newActiveMapId) {
					return [new SetMapsDataActionStore(newMapsData), new ActiveMapChangedAction(newActiveMapId)];
				} else {
					return [new SetMapsDataActionStore(newMapsData)];
				}
			}
		);


	@Effect()
	positionChanged$: Observable<any> = this.actions$
		.ofType(MapActionTypes.POSITION_CHANGED)
		.withLatestFrom(this.store$.select('map'), (action: PositionChangedAction, state: IMapState): any => {
			return [MapFacadeService.mapById(state.mapsData, action.payload.id), state.mapsData, action.payload.position];
		})
		.filter(([selectedMap]) => !_isEmpty(selectedMap))
		.map( ([selectedMap, mapsData, position]) => {
			selectedMap.data.position = position;
			return new SetMapsDataActionStore([...mapsData]);
		});


	@Effect()
	backToWorldView$: Observable<any> = this.actions$
		.ofType(MapActionTypes.BACK_TO_WORLD)
		.withLatestFrom(this.store$.select('map'), (action: BackToWorldAction, mapState: IMapState) => {
			const mapId = action.payload.mapId ? action.payload.mapId : mapState.activeMapId;
			return [action, mapId, mapState.mapsData];
		})
		.mergeMap(([action, mapId, mapsData]: [BackToWorldAction, string, CaseMapState[]]) => {
			const selectedMap = MapFacadeService.mapById(mapsData, mapId);
			const comm = this.communicatorsService.provide(mapId);
			comm.loadInitialMapSource(selectedMap.data.position.boundingBox);

			const updatedMapsData = _cloneDeep(mapsData);
			updatedMapsData.forEach(
				(map) => {
					if(map.id === mapId){
						map.data.overlay = null;
						map.data.isAutoImageProcessingActive = false;
					}
				});
			return [
				new SetMapsDataActionStore(updatedMapsData),
			];
		});

	constructor(private actions$: Actions,
				private mapFacadeService: MapFacadeService,
				private communicatorsService: ImageryCommunicatorService,
				private store$: Store<any>) {}
}
