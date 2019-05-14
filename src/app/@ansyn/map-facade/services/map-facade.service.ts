import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { IMapState, selectMapsList } from '../reducers/map.reducer';
import { MapInstanceChangedAction, PositionChangedAction } from '../actions/map.actions';
import {
	ImageryMapPosition,
	ImageryCommunicatorService,
	IMapInstanceChanged,
	IMapSettings,
	getFootprintIntersectionRatioInExtent
} from '@ansyn/imagery';
import { Observable } from 'rxjs';

// @dynamic
@Injectable({
	providedIn: 'root'
})
export class MapFacadeService {
	subscribers: { [key: string]: any[] } = {};

	mapsList$ = this.store.select(selectMapsList);
	mapsList: IMapSettings[] = [];

	static isNotIntersect(extentPolygon, footprint, overlayCoverage): boolean {
		const intersection = getFootprintIntersectionRatioInExtent(extentPolygon, footprint);
		return intersection < overlayCoverage;
	}
	// @todo IOveraly
	static isOverlayGeoRegistered(overlay: any): boolean {
		if (!overlay) {
			return true;
		}
		return overlay.isGeoRegistered !== 'notGeoRegistered';
	}

	static activeMap(mapState: IMapState): IMapSettings {
		return mapState.entities[mapState.activeMapId];
	}

	static mapById(mapsList: IMapSettings[], mapId: string): IMapSettings {
		return mapsList.find(({ id }: IMapSettings) => {
			return id === mapId;
		});
	}

	constructor(protected store: Store<IMapState>, protected imageryCommunicatorService: ImageryCommunicatorService) {
		(<Observable<any>>this.mapsList$).subscribe((mapsList) => this.mapsList = mapsList);
	}

	initEmitters(id: string) {
		this.removeEmitters(id);

		const communicator = this.imageryCommunicatorService.provide(id);
		const communicatorSubscribers = [];
		communicatorSubscribers.push(
			communicator.positionChanged.subscribe((position) => this.positionChanged({ id: communicator.id, position })),
			communicator.mapInstanceChanged.subscribe(this.mapInstanceChanged.bind(this))
		);
		this.subscribers[id] = communicatorSubscribers;
	}

	removeEmitters(id: string) {
		if (this.subscribers[id]) {
			this.subscribers[id].forEach((subscriber) => subscriber.unsubscribe());
			delete this.subscribers[id];
		}
	}

	mapInstanceChanged($event: IMapInstanceChanged) {
		this.store.dispatch(new MapInstanceChangedAction($event));
	}

	positionChanged($event: { id: string, position: ImageryMapPosition }) {
		const mapInstance = <IMapSettings> MapFacadeService.mapById(this.mapsList, $event.id);
		this.store.dispatch(new PositionChangedAction({ ...$event, mapInstance }));
	}
}
