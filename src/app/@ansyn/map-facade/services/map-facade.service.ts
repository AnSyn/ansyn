import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { LayoutKey } from '../models/maps-layout';
import { IMapState, selectLayout, selectMapsList } from '../reducers/map.reducer';
import { MapInstanceChangedAction, PositionChangedAction } from '../actions/map.actions';
import {
	ImageryMapPosition,
	ImageryCommunicatorService,
	IMapInstanceChanged,
	IMapSettings,
	getFootprintIntersectionRatioInExtent
} from '@ansyn/imagery';
import { Observable } from 'rxjs';
import { saveAs } from 'file-saver';
import { mapsToPng } from '../utils/exportMaps';

// @dynamic
@Injectable({
	providedIn: 'root'
})
export class MapFacadeService {
	subscribers: { [key: string]: any[] } = {};

	mapsList$ = this.store.select(selectMapsList);
	mapsList: IMapSettings[] = [];

	layout: LayoutKey;
	layout$ = this.store.select(selectLayout);

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
		(<Observable<any>>this.layout$).subscribe((layout) => this.layout = layout);
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

	exportMapsToPng() {
				const communicators = this.imageryCommunicatorService.communicatorsAsArray();
				const maps = [];
				communicators.forEach(comm => {
					const map = comm.ActiveMap;
					try {
						maps.push(map.getExportData());
					}
					catch (e) {
						console.log('unable get ' + map.getExtraData());
						maps.push({width: 1, height: 1, data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='});
					}
				});
				mapsToPng(maps, this.layout).subscribe(blob => saveAs(blob, "map.png"));
	}
}
