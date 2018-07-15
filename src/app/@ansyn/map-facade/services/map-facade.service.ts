import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { IMapState, mapStateSelector } from '../reducers/map.reducer';
import {
	MapInstanceChangedAction,
	PositionChangedAction,
} from '../actions/map.actions';
import { ICaseMapState } from '@ansyn/core/models/case.model';
import { IOverlay } from '@ansyn/core/models/overlay.model';
import { ICaseMapPosition } from '@ansyn/core/models/case-map-position.model'
import { IMapInstanceChanged } from '@ansyn/imagery/imagery/manager/imagery.component.manager';
import { Observable } from 'rxjs';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';

@Injectable()
export class MapFacadeService {
	subscribers: {[key: string]: any[]} = {};

	mapsList$ = this.store.select(mapStateSelector).pluck<IMapState, ICaseMapState[]>('mapsList');
	mapsList: ICaseMapState[] = [];

	static isOverlayGeoRegistered(overlay: IOverlay): boolean {
		if (!overlay) {
			return true;
		}
		return overlay.isGeoRegistered;
	}

	static activeMap(mapState: IMapState): ICaseMapState {
		return MapFacadeService.mapById(mapState.mapsList, mapState.activeMapId);
	}

	static mapById(mapsList: ICaseMapState[], mapId: string): ICaseMapState {
		return mapsList.find(({ id }: ICaseMapState) => id === mapId);
	}

	constructor(protected store: Store<IMapState>, protected imageryCommunicatorService: ImageryCommunicatorService) {
		(<Observable<any>>this.mapsList$).subscribe((mapsList) => this.mapsList = mapsList);
	}

	initEmitters(id: string) {
		const communicator = this.imageryCommunicatorService.provide(id);
		const communicatorSubscribers = [];
		communicatorSubscribers.push(
			communicator.positionChanged.subscribe(this.positionChanged.bind(this)),
			communicator.mapInstanceChanged.subscribe(this.mapInstanceChanged.bind(this)),
		);
		this.subscribers[id] = communicatorSubscribers;
	}

	removeEmitters(id: string) {
		this.subscribers[id].forEach((subscriber) => subscriber.unsubscribe());
		delete this.subscribers[id];
	}

	mapInstanceChanged($event: IMapInstanceChanged) {
		this.store.dispatch(new MapInstanceChangedAction($event));
	}

	positionChanged($event: { id: string, position: ICaseMapPosition }) {
		const mapInstance = <ICaseMapState> MapFacadeService.mapById(this.mapsList, $event.id);
		this.store.dispatch(new PositionChangedAction({ ...$event, mapInstance }));
	}
}
