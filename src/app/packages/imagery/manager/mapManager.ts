import { MapCommunicator } from '../api/mapCommunicator';
import { IProvidedMap } from '../model/model';
/**
 * Created by AsafMasa on 27/04/2017.
 */
export class MapManager {
	private _mapCommunicator: MapCommunicator;
	private _activeMap: IProvidedMap;
	private _subscriptions = [];

	constructor(mapCommunicator: MapCommunicator) {
		this._mapCommunicator = mapCommunicator;

		this.registerMapCommunicatorEvents();
	}

	public setActiveMap(activeMap: IProvidedMap) {
		this._activeMap = activeMap;
	}

	private registerMapCommunicatorEvents() {
		this._subscriptions.push(this._mapCommunicator.mapBoundingRectangleChanged.subscribe((boundingRectangle: GeoJSON.MultiPolygon) => {
			this._activeMap.setBoundingRectangle(boundingRectangle);
		}));

		this._subscriptions.push(this._mapCommunicator.mapCenterChanged.subscribe((center: GeoJSON.Point) => {
			this._activeMap.setCenter(center);
		}));
	}

	public dispose() {
		for (let i = 0; i < this._subscriptions.length; i++) {
			this._subscriptions[i].unsubscribe();
		}
		this._subscriptions = [];
	}
}
