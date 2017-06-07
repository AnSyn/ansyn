import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { IMapState } from '../reducers/map.reducer';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { CommuincatorsChangeAction, PositionChangedAction } from '../actions/map.actions';
import { Position } from '@ansyn/core';

@Injectable()
export class MapFacadeService {
	private positionChangedSubscribers = [];

	constructor(private store: Store<IMapState>, private imageryCommunicatorService: ImageryCommunicatorService) {
		this.initPositionChangedEmitters();

		imageryCommunicatorService.communicatorsChange.subscribe((communicators) => {
			this.store.dispatch(new CommuincatorsChangeAction(communicators));
		});

	}

	initPositionChangedEmitters() {
		this.unsubscribeAll();
		Object.keys(this.imageryCommunicatorService.communicators).forEach((id)=>{
			this.positionChangedSubscribers.push(this.imageryCommunicatorService.provideCommunicator(id).positionChanged.subscribe(this.positionChanged.bind(this)));
		});
	}

	unsubscribeAll() {
		this.positionChangedSubscribers.forEach((subscriber)=>{
			subscriber.unsubscribe();
		});
		this.positionChangedSubscribers = [];
	}

	positionChanged($event: {id: string, position: Position}) {
		this.store.dispatch(new PositionChangedAction($event));
	}
}
