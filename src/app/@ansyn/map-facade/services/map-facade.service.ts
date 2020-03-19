import { ExportMapsToPngRequestedAction } from '../actions/map.actions';
import { Injectable } from '@angular/core';
import {
	ImageryCommunicatorService,
	ImageryMapPosition,
	IMapInstanceChanged,
	IMapSettings
} from '@ansyn/imagery';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
	MapInstanceChangedAction,
	PositionChangedAction,
} from '../actions/map.actions';
import { LayoutKey } from '../models/maps-layout';
import { IMapState, selectLayout, selectMapsList } from '../reducers/map.reducer';

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
		if (!Boolean(mapsList)) {
			return undefined;
		}

		return mapsList.find(({ id }: IMapSettings) => {
			return id === mapId;
		});
	}

	constructor(protected store: Store<IMapState>,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
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
		if (Boolean(this.mapsList)) {
			const mapInstance = <IMapSettings>MapFacadeService.mapById(this.mapsList, $event.id);
			this.store.dispatch(new PositionChangedAction({ ...$event, mapInstance }));
		}
	}

	public exportMapsToPng(): void {
		this.store.dispatch(new ExportMapsToPngRequestedAction());
	}
}
