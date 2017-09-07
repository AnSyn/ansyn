import { Injectable } from '@angular/core';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { MapFacadeService } from '../services/map-facade.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import { MapActionTypes, SetMapAutoImageProcessing } from '../actions/map.actions';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { isNil as _isNil } from 'lodash';
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
		.ofType(MapActionTypes.ADD_MAP_INSTANCE, MapActionTypes.REMOVE_MAP_INSTACNE, MapActionTypes.MAP_INSTANCE_CHANGED_ACTION)
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
		.map(toPayload)
		.map(({mapId, toggle_value}) => [this.communicatorsService.provide(mapId), toggle_value])
		.filter(([comm]) => !_isNil(comm))
		.do(([comm, toggle_value]) => {
			comm.setAutoImageProcessing(toggle_value);
		});

	@Effect({dispatch:false})
	onContextMenuShow$: Observable<any> = this.actions$
		.ofType(MapActionTypes.CONTEXT_MENU.SHOW)
		.share();

	constructor(private actions$: Actions, private mapFacadeService: MapFacadeService, private communicatorsService: ImageryCommunicatorService) {}
}
