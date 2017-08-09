import { Injectable } from '@angular/core';
import { IMapPlugin } from '../model/imap-plugin';
import { IMapVisualizer } from '../model/imap-visualizer';
/**
 * Created by AsafMasa on 24/04/2017.
 */

@Injectable()
export class ImageryProviderService {

	private _mapProviders: { [id: string]: any };
	private _mapPluginProviders: { [mapType: string]: [{"pluginClass": any}] };
	private _mapVisualizersProviders: Map<string, [{"visualizerClass": any, args: any}]>;

	constructor() {
		this._mapProviders = {};
		this._mapPluginProviders = {};
		this._mapVisualizersProviders = new Map<string, [{visualizerClass: any, args: any}]>();
	}

	public registerMapProvider(mapType: string, component: any) {
		if (this._mapProviders[mapType]) {
			throw new Error(`'Map Provider ${mapType} is already registered.'`);
		}

		this._mapProviders[mapType] = component;
	}

	public registerPlugin(mapType: string, pluginClass: any) {

		if (!this._mapPluginProviders[mapType]) {
			this._mapPluginProviders[mapType] = [{"pluginClass": pluginClass}];
		} else {
			this._mapPluginProviders[mapType].push({"pluginClass": pluginClass});
		}
	}

	public provideMap(mapType: string): any {
		if (!this._mapProviders[mapType]) {
			throw new Error(`'mapType ${mapType} doesn't exist, can't provide it`);
		}

		const providedMap = this._mapProviders[mapType];
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
			this._mapVisualizersProviders.set(mapType, [{visualizerClass: visualizerClass, args: constructorArgs}]);
		} else {
			const existingVisualizers = this._mapVisualizersProviders.get(mapType);
			existingVisualizers.push({visualizerClass: visualizerClass, args: constructorArgs});
			this._mapVisualizersProviders.set(mapType, existingVisualizers);
		}
	}

	public getVisualizersConfig(mapType: string): [{visualizerClass: any, args: any}] {
		const hasMapVisualizersProviders = this._mapVisualizersProviders.has(mapType);
		if (!hasMapVisualizersProviders) {
			return null;
		}
		const existingVisualizersConfig = this._mapVisualizersProviders.get(mapType);
		return existingVisualizersConfig;
	}
}
