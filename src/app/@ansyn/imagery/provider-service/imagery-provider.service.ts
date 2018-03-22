import { Inject, Injectable } from '@angular/core';
import { BaseImageryVisualizer } from '../model/base-imagery-visualizer';
import { VisualizersConfig } from '@ansyn/core/tokens/visualizers-config.token';

export interface IProvidedMap {
	mapType: string;
	mapComponent: any;
}

export interface InjectedMapVisualizer {
	type: string;
	visualizer: BaseImageryVisualizer
}

@Injectable()
export class ImageryProviderService {

	private _mapProviders: { [id: string]: IProvidedMap };

	constructor(@Inject(VisualizersConfig) visualizersConfig: any) {
		this._mapProviders = {};
	}

	public registerMapProvider(mapName: string, mapType: string, component: any) {
		if (this._mapProviders[mapName]) {
			throw new Error(`'Map Provider ${mapName} is already registered.'`);
		}

		this._mapProviders[mapName] = { mapType: mapType, mapComponent: component };
	}

	getProviders() {
		return this._mapProviders;
	}

	public provideMap(mapName: string): IProvidedMap {
		if (!this._mapProviders[mapName]) {
			throw new Error(`'mapName ${mapName} doesn't exist, can't provide it`);
		}

		return this._mapProviders[mapName];
	}
}
