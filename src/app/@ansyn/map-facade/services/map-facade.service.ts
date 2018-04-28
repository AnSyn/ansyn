import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { IMapState, mapStateSelector } from '../reducers/map.reducer';
import {
	ContextMenuShowAction,
	MapInstanceChangedAction,
	PositionChangedAction,
	ImageryPluginsInitialized
} from '../actions/map.actions';
import { CaseMapState } from '@ansyn/core/models/case.model';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { CaseMapPosition } from '@ansyn/core/models/case-map-position.model'
import { MapInstanceChanged } from '@ansyn/imagery/imagery/manager/imagery.component.manager';
import { Observable } from 'rxjs/Observable';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';

@Injectable()
export class MapFacadeService {
	subscribers: {[key: string]: any[]} = {};

	mapsList$ = this.store.select(mapStateSelector).pluck<IMapState, CaseMapState[]>('mapsList');
	mapsList: CaseMapState[] = [];

	static isOverlayGeoRegistered(overlay: Overlay): boolean {
		if (!overlay) {
			return true;
		}
		return overlay.isGeoRegistered;
	}

	static activeMap(mapState: IMapState): CaseMapState {
		return MapFacadeService.mapById(mapState.mapsList, mapState.activeMapId);
	}

	static mapById(mapsList: CaseMapState[], mapId: string): CaseMapState {
		return mapsList.find(({ id }: CaseMapState) => id === mapId);
	}

	constructor(protected store: Store<IMapState>, protected imageryCommunicatorService: ImageryCommunicatorService) {
		(<Observable<any>>this.mapsList$).subscribe((mapsList) => this.mapsList = mapsList);
	}

	initEmitters(id: string) {
		const communicator = this.imageryCommunicatorService.provide(id);
		const communicatorSubscribers = [];
		communicatorSubscribers.push(
			communicator.positionChanged.subscribe(this.positionChanged.bind(this)),
			communicator.contextMenu.subscribe(this.contextMenu.bind(this)),
			communicator.mapInstanceChanged.subscribe(this.mapInstanceChanged.bind(this)),
			communicator.imageryPluginsInitialized.subscribe(this.imageryPluginsInitialized.bind(this))
		);
		this.subscribers[id] = communicatorSubscribers;
	}

	removeEmitters(id: string) {
		this.subscribers[id].forEach((subscriber) => subscriber.unsubscribe());
		delete this.subscribers[id];
	}

	mapInstanceChanged($event: MapInstanceChanged) {
		this.store.dispatch(new MapInstanceChangedAction($event));
	}

	positionChanged($event: { id: string, position: CaseMapPosition }) {
		const mapInstance = <CaseMapState> MapFacadeService.mapById(this.mapsList, $event.id);
		this.store.dispatch(new PositionChangedAction({ ...$event, mapInstance }));
	}

	contextMenu(event) {
		this.store.dispatch(new ContextMenuShowAction(event));
	}

	imageryPluginsInitialized(event) {
		this.store.dispatch(new ImageryPluginsInitialized(event));
	}
}
