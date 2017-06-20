import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { IMapState } from '../reducers/map.reducer';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { AddMapInstacneAction,RemoveMapInstanceAction, PositionChangedAction, MapSingleClickAction } from '../actions/map.actions';
import { Position } from '@ansyn/core';

@Injectable()
export class MapFacadeService {
	private _subscribers = [];

	constructor(private store: Store<IMapState>, private imageryCommunicatorService: ImageryCommunicatorService) {
		this.initEmitters();

		imageryCommunicatorService.instanceCreated.subscribe((communicatorsIds) => {
			this.store.dispatch(new AddMapInstacneAction(communicatorsIds));
		});

		imageryCommunicatorService.instanceRemoved.subscribe((communicatorsIds) => {
			this.store.dispatch(new RemoveMapInstanceAction(communicatorsIds));
		});

	}

	initEmitters() {
		this.unsubscribeAll();
		Object.keys(this.imageryCommunicatorService.communicators).forEach((id)=>{
			this._subscribers.push(this.imageryCommunicatorService.provide(id).positionChanged.subscribe(this.positionChanged.bind(this)));
			this._subscribers.push(this.imageryCommunicatorService.provide(id).singleClick.subscribe(this.singleClick.bind(this)));
		});
	}

	unsubscribeAll() {
		this._subscribers.forEach((subscriber)=>{
			subscriber.unsubscribe();
		});
		this._subscribers = [];
	}

	positionChanged($event: {id: string, position: Position}) {
		this.store.dispatch(new PositionChangedAction($event));
	}

	singleClick(event){
		this.store.dispatch(new MapSingleClickAction(event));
	}
}
