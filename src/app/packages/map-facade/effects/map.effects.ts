import { Injectable } from '@angular/core';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { IMapState } from '../reducers/map.reducer';
import { MapFacadeService } from '../services/map-facade.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import { MapActionTypes,CompositeMapShadowAction, SetMapAutoImageProcessing } from '../actions/map.actions';
import { ImageryCommunicatorService } from '@ansyn/imagery';

import 'rxjs/add/operator/share';


@Injectable()
export class MapEffects{

	@Effect({dispatch: false})
	onUpdateSize$: Observable<void> = this.actions$
		.ofType(MapActionTypes.UPDATE_MAP_SIZE)
		.map( () => {
			//@todo move this to service we will need it pass function name and send it to all the maps
			Object.keys(this.communicatorsService.communicators).forEach((imagery_id: string)=>{
				this.communicatorsService.provide(imagery_id).updateSize();
			});
		});


	@Effect({dispatch:false})
	onCommunicatorChange$: Observable<any> = this.actions$
		.ofType(MapActionTypes.ADD_MAP_INSTANCE,MapActionTypes.REMOVE_MAP_INSTACNE)
		.map(() => {
			this.mapFacadeService.initEmitters();
		});



	@Effect({dispatch:false})
	onStopMapShadowMouse$: Observable<any> = this.actions$
		.ofType(MapActionTypes.STOP_MAP_SHADOW_ACTIONS)
		.share();

	@Effect({dispatch:false})
	onStartMapShadowMouse$: Observable<any> = this.actions$
		.ofType(MapActionTypes.START_MAP_SHADOW_ACTIONS)
		.share();

	@Effect({dispatch:false})
	onComposeMapShadowMouse$: Observable<any> = this.actions$
		.ofType(MapActionTypes.COMPOSITE_MAP_SHADOW_ACTION)
		.share();

	@Effect({dispatch:false})
	onToggleImageProcessing$: Observable<any> = this.actions$
		.ofType(MapActionTypes.SET_MAP_AUTO_IMAGE_PROCESSING)
		.map((action: SetMapAutoImageProcessing) => {
			const comm = this.communicatorsService.provide(action.payload.mapId);
			comm.setAutoImageProcessing(action.payload.toggle_value);
		});

	onMapContextMenu$: Observable<any> = this.actions$
		.ofType(MapActionTypes.MAP_CONTEXT_MENU)
		.share();

	constructor(private actions$: Actions, private store: Store<IMapState>, private mapFacadeService: MapFacadeService, private communicatorsService: ImageryCommunicatorService) {}
}
