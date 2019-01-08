import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { IMapState, selectMapsList } from '../reducers/map.reducer';
import { MapInstanceChangedAction, PositionChangedAction } from '../actions/map.actions';
import { getFootprintIntersectionRatioInExtent, ICaseMapPosition, ICaseMapState, IOverlay } from '@ansyn/core';
import { ImageryCommunicatorService, IMapInstanceChanged } from '@ansyn/imagery';
import { Observable } from 'rxjs';

// @dynamic
@Injectable({
	providedIn: 'root'
})
export class MapFacadeService {
	subscribers: { [key: string]: any[] } = {};

	mapsList$ = this.store.select(selectMapsList);
	mapsList: ICaseMapState[] = [];

	static isNotIntersect(extentPolygon, footprint, overlayCoverage): boolean {
		const intersection = getFootprintIntersectionRatioInExtent(extentPolygon, footprint);
		return intersection < overlayCoverage;
	}

	static isOverlayGeoRegistered(overlay: IOverlay): boolean {
		if (!overlay) {
			return true;
		}
		return overlay.isGeoRegistered;
	}

	static activeMap(mapState: IMapState): ICaseMapState {
		return mapState.entities[mapState.activeMapId];
	}

	static mapById(mapsList: ICaseMapState[], mapId: string): ICaseMapState {
		return mapsList.find(({ id }: ICaseMapState) => {
			return id === mapId;
		});
	}

	constructor(protected store: Store<IMapState>, protected imageryCommunicatorService: ImageryCommunicatorService) {
		(<Observable<any>>this.mapsList$).subscribe((mapsList) => this.mapsList = mapsList);
	}

	initEmitters(id: string) {
		const communicator = this.imageryCommunicatorService.provide(id);
		const communicatorSubscribers = [];
		communicatorSubscribers.push(
			communicator.positionChanged.subscribe((position) => this.positionChanged({ id: communicator.id, position })),
			communicator.mapInstanceChanged.subscribe(this.mapInstanceChanged.bind(this))
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
