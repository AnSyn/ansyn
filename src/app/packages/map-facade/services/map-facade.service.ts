import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { IMapState } from '../reducers/map.reducer';
import { ImageryCommunicatorService } from '../../imagery/api/imageryCommunicator.service';
import { PositionChangedAction } from '../actions/map.actions';

@Injectable()
export class MapFacadeService {

	constructor(private store: Store<IMapState>, private imageryCommunicatorService: ImageryCommunicatorService) {
		imageryCommunicatorService.provideCommunicator('imagery1').positionChanged.subscribe(this.positionChanged.bind(this))
	}

	positionChanged(extent: [number, number, number, number]) {
		this.store.dispatch(new PositionChangedAction(extent));
	}
}
