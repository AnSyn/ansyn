import { Inject, Injectable, Optional } from '@angular/core';
import { BaseImageryPlugin } from '../plugins/base-imagery-plugin';
import { IMapVisualizer } from '../model/imap-visualizer';
import { MapVisualizer } from '../model/imap-visualizer.token';
import { VisualizersConfig } from '@ansyn/core/tokens/visualizers-config.token';

export interface IProvidedMap {
	mapType: string;
	mapComponent: any;
}

export interface InjectedMapVisualizer {
	type: string;
	visualizer: IMapVisualizer
}

@Injectable()
export class ImageryProviderService {

	private _mapProviders: { [id: string]: IProvidedMap };
	private _mapVisualizersProviders: Map<string, [{ visualizerClass: any, args: any }]>;

	constructor(@Optional() @Inject(MapVisualizer) protected mapVisualizers: InjectedMapVisualizer[],
				@Inject(VisualizersConfig) visualizersConfig: any) {
		this._mapProviders = {};
		this._mapVisualizersProviders = new Map<string, [{ visualizerClass: any, args: any }]>();

		if (mapVisualizers) {
			mapVisualizers.forEach(mapVisualizer =>
				this.registerVisualizer(mapVisualizer.type, mapVisualizer.visualizer, visualizersConfig[mapVisualizer.visualizer.type]));
		}
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

	public registerVisualizer(mapType: string, visualizerClass: any, constructorArgs?: any) {
		if (!this._mapVisualizersProviders.has(mapType)) {
			this._mapVisualizersProviders.set(mapType, [{ visualizerClass, args: constructorArgs }]);
		} else {
			const existingVisualizers = this._mapVisualizersProviders.get(mapType);
			existingVisualizers.push({ visualizerClass, args: constructorArgs });
			this._mapVisualizersProviders.set(mapType, existingVisualizers);
		}
	}

	public getVisualizersConfig(mapType: string): [{ visualizerClass: any, args: any }] {
		const hasMapVisualizersProviders = this._mapVisualizersProviders.has(mapType);
		if (!hasMapVisualizersProviders) {
			return null;
		}
		return this._mapVisualizersProviders.get(mapType);
	}
}
