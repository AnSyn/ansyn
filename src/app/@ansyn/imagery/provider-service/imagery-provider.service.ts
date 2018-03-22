import { Injectable } from '@angular/core';

export interface IProvidedMap {
	mapType: string;
	mapComponent: any;
}

@Injectable()
export class ImageryProviderService {

	private _mapProviders: { [id: string]: IProvidedMap } = {};

	get mapProviders() {
		return this._mapProviders;
	}

	public registerMapProvider(mapName: string, mapType: string, component: any) {
		if (this._mapProviders[mapName]) {
			throw new Error(`'Map Provider ${mapName} is already registered.'`);
		}

		this._mapProviders[mapName] = { mapType: mapType, mapComponent: component };
	}

	public provideMap(mapName: string): IProvidedMap {
		if (!this._mapProviders[mapName]) {
			throw new Error(`'mapName ${mapName} doesn't exist, can't provide it`);
		}

		return this._mapProviders[mapName];
	}
}
