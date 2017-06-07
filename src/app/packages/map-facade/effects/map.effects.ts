import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { IMapState } from '../reducers/map.reducer';
import { MapFacadeService } from '../services/map-facade.service';
import { Observable } from 'rxjs/Observable';
import { MapActionTypes } from '../actions/map.actions';
import { ImageryCommunicatorService } from '@ansyn/imagery';


@Injectable()
export class MapEffects{

	@Effect({dispatch: false})
	onUpdateSize$: Observable<void> = this.actions$
		.ofType(MapActionTypes.UPDATE_MAP_SIZE)
		.map( () => {

			Object.keys(this.communicatorsService.communicators).forEach((imagery_id: string)=>{
				this.communicatorsService.provideCommunicator(imagery_id).updateSize();
			});
		});

	@Effect({dispatch: false})
	onCommunicatorChange$: Observable<void> = this.actions$
		.ofType(MapActionTypes.COMMUNICATORS_CHANGE)
		.map((): void => {
			this.mapFacadeService.initPositionChangedEmitters();
		});

	@Effect({dispatch:false})
	onStopMapShadowMouse$: Observable<any> = this.actions$
		.ofType(MapActionTypes.STOP_MAP_SHADOW_ACTIONS)
		.debug('stop')
		.share();	

	@Effect({dispatch:false})
	onStartMapShadowMouse$: Observable<any> = this.actions$	
		.ofType(MapActionTypes.START_MAP_SHADOW_ACTIONS)	
		.debug('start')
		.share();

	constructor(private actions$: Actions, private store: Store<IMapState>, private mapFacadeService: MapFacadeService, private communicatorsService: ImageryCommunicatorService) {}	
}
