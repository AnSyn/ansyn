import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { IMapState } from '../reducers/map.reducer';
import { ImageryCommunicatorService, IMapVisualizer } from '@ansyn/imagery';
import {
	AddMapInstacneAction, RemoveMapInstanceAction, PositionChangedAction, MapSingleClickAction,
	ContextMenuShowAction, HoverFeatureTriggerAction, DbclickFeatureTriggerAction
} from '../actions/map.actions';
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

		this.imageryCommunicatorService.communicatorsAsArray().forEach( (communicator): void => {
			this._subscribers.push(communicator.positionChanged.subscribe(this.positionChanged.bind(this)));
			this._subscribers.push(communicator.singleClick.subscribe(this.singleClick.bind(this)));
			this._subscribers.push(communicator.contextMenu.subscribe(this.contextMenu.bind(this)));
			communicator.getAllVisualizers().forEach((visualizer: IMapVisualizer) => {
				this._subscribers.push(visualizer.onHoverFeature.subscribe(this.hoverFeature.bind(this)));
				this._subscribers.push(visualizer.doubleClickFeature.subscribe(this.dbclickFeature.bind(this)));
			});
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

	contextMenu(event){
		this.store.dispatch(new ContextMenuShowAction(event));
	}

	hoverFeature(event) {
		this.store.dispatch(new HoverFeatureTriggerAction(event))
	}

	dbclickFeature(event) {
		this.store.dispatch(new DbclickFeatureTriggerAction(event))
	}

}
