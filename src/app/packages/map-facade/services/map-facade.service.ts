import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { IMapState } from '../reducers/map.reducer';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { PositionChangedAction } from '../actions/map.actions';
import { Position } from '@ansyn/core';

@Injectable()
export class MapFacadeService {

	constructor(private store: Store<IMapState>, private imageryCommunicatorService: ImageryCommunicatorService) {
		imageryCommunicatorService.provideCommunicator('imagery1').positionChanged.subscribe(this.positionChanged.bind(this))
	}

	positionChanged(position: Position) {
		this.store.dispatch(new PositionChangedAction(position));
	}
}
