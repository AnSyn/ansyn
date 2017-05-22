import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { IMapState } from '../reducers/map.reducer';
import { MapFacadeService } from '../services/map-facade.service';
import { Observable } from 'rxjs';
import { MapActionTypes } from '../actions/map.actions';
import { ImageryCommunicatorService } from '../../imagery/api/imageryCommunicator.service';

@Injectable()
export class MapEffects{

	constructor(private actions$: Actions, private store: Store<IMapState>, private mapFacadeService: MapFacadeService, private communicator: ImageryCommunicatorService) {}

	@Effect({dispatch: false})
	onUpdateSize$: Observable<void> = this.actions$
		.ofType(MapActionTypes.UPDATE_MAP_SIZE)
		.map( () => {
			this.communicator.provideCommunicator('imagery1').updateSize();
		});

	@Effect({dispatch: false})
	onCommunicatorChange$: Observable<void> = this.actions$
		.ofType(MapActionTypes.COMMUNICATORS_CHANGE)
		.map((): void => {
			this.mapFacadeService.initPositionChangedEmitters();
		})
}
