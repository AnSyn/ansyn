import { Injectable } from '@angular/core';
import {
	getFootprintIntersectionRatioInExtent,
	ICanvasExportData,
	ImageryCommunicatorService,
	ImageryMapPosition,
	IMapInstanceChanged,
	IMapSettings
} from '@ansyn/imagery';
import { Store } from '@ngrx/store';
import { saveAs } from 'file-saver';
import { Observable } from 'rxjs';
import { take, tap, switchMap } from 'rxjs/operators';
import { MapInstanceChangedAction, PositionChangedAction } from '../actions/map.actions';
import { LayoutKey } from '../models/maps-layout';
import { IMapState, selectLayout, selectMaps, selectMapsIds, selectMapsList } from '../reducers/map.reducer';
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
			communicator.positionChanged.subscribe((position) => this.positionChanged({
				id: communicator.id,
				position
			})),
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
		const mapInstance = <IMapSettings>MapFacadeService.mapById(this.mapsList, $event.id);
		this.store.dispatch(new PositionChangedAction({ ...$event, mapInstance }));
	}

	exportMapsToPng() {
		this.store.select(selectMapsIds).pipe(
			take(1),
			switchMap((mapsIds: string[]) => {
				const _maps = [];
				mapsIds.forEach((mapId) => {
					const provider = this.imageryCommunicatorService.provide(mapId);
					const exportData: ICanvasExportData = provider.ActiveMap.getExportData();
					_maps.push(exportData);
				});
				return mapsToPng(_maps, this.layout)
			}),
			tap(blob => saveAs(blob, 'map.png'))
		).subscribe();
	}
}
