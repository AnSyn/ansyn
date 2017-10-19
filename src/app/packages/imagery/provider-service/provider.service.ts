import { Inject, Injectable } from '@angular/core';
import { IMapPlugin } from '../model/imap-plugin';
import { MapVisualizer } from '../imagery.module';
import { IMapVisualizer } from '../model/imap-visualizer';

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
	private _mapPluginProviders: { [mapType: string]: [{ 'pluginClass': any }] };
	private _mapVisualizersProviders: Map<string, [{ 'visualizerClass': any, args: any }]>;

	constructor(@Inject(MapVisualizer) private mapVisualizers: InjectedMapVisualizer[]) {
		this._mapProviders = {};
		this._mapPluginProviders = {};
		this._mapVisualizersProviders = new Map<string, [{ visualizerClass: any, args: any }]>();

		mapVisualizers.forEach(mapVisualizer =>
			this.registerVisualizer(mapVisualizer.type, mapVisualizer.visualizer));
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

		return this._mapProviders[mapName];
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
		return this._mapVisualizersProviders.get(mapType);
	}
}
