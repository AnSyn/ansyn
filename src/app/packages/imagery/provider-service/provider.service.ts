import { Injectable } from '@angular/core';
import { IMapPlugin } from '../model/imap-plugin';

/**
 * Created by AsafMasa on 24/04/2017.
 */

export interface IProvidedMap {
	mapType: string;
	mapComponent: any;
}

@Injectable()
export class ImageryProviderService {

	private _mapProviders: { [id: string]: IProvidedMap };
	private _mapPluginProviders: { [mapType: string]: [{ 'pluginClass': any }] };
	private _mapVisualizersProviders: Map<string, [{ 'visualizerClass': any, args: any }]>;

	constructor() {
		this._mapProviders = {};
		this._mapPluginProviders = {};
		this._mapVisualizersProviders = new Map<string, [{ visualizerClass: any, args: any }]>();
	}

	public registerMapProvider(mapName: string, mapType: string, component: any) {
		if (this._mapProviders[mapName]) {
			throw new Error(`'Map Provider ${mapName} is already registered.'`);
		}

		this._mapProviders[mapName] = { mapType: mapType, mapComponent: component };
	}

	public registerPlugin(mapType: string, pluginClass: any) {

		if (!this._mapPluginProviders[mapType]) {
			this._mapPluginProviders[mapType] = [{ 'pluginClass': pluginClass }];
		} else {
			this._mapPluginProviders[mapType].push({ 'pluginClass': pluginClass });
		}
	}

	public provideMap(mapName: string): IProvidedMap {
		if (!this._mapProviders[mapName]) {
			throw new Error(`'mapName ${mapName} doesn't exist, can't provide it`);
		}

		const providedMap = this._mapProviders[mapName];
		return providedMap;
	}

	public createPlugins(mapType: string): IMapPlugin[] {
		const mapPluginProviders = this._mapPluginProviders[mapType];
		if (!mapPluginProviders) {
			return null;
		}

		const plugins: IMapPlugin[] = [];
		mapPluginProviders.forEach(provider => {
			const providedPlugin: IMapPlugin = new provider.pluginClass();
			plugins.push(providedPlugin);
		});

		return plugins;
	}

	public registerVisualizer(mapType: string, visualizerClass: any, constructorArgs?: any) {
		if (!this._mapVisualizersProviders.has(mapType)) {
			this._mapVisualizersProviders.set(mapType, [{ visualizerClass: visualizerClass, args: constructorArgs }]);
		} else {
			const existingVisualizers = this._mapVisualizersProviders.get(mapType);
			existingVisualizers.push({ visualizerClass: visualizerClass, args: constructorArgs });
			this._mapVisualizersProviders.set(mapType, existingVisualizers);
		}
	}

	public getVisualizersConfig(mapType: string): [{ visualizerClass: any, args: any }] {
		const hasMapVisualizersProviders = this._mapVisualizersProviders.has(mapType);
		if (!hasMapVisualizersProviders) {
			return null;
		}
		const existingVisualizersConfig = this._mapVisualizersProviders.get(mapType);
		return existingVisualizersConfig;
	}
}
