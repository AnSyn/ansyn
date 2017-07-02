import { Injectable } from '@angular/core';
import { IMapPlugin } from '../model/imap-plugin';
/**
 * Created by AsafMasa on 24/04/2017.
 */

@Injectable()
export class ImageryProviderService {

	private _mapProviders: { [id: string]: any };
	private _mapPluginProviders: { [mapType: string]: [{"pluginType": string, "pluginClass": any}] };

	constructor() {
		this._mapProviders = {};
		this._mapPluginProviders = {};
	}

	public registerMapProvider(mapType: string, component: any) {
		if (this._mapProviders[mapType]) {
			throw new Error(`'Map Provider ${mapType} is already registered.'`);
		}

		this._mapProviders[mapType] = component;
	}

	public registerPlugin(mapType: string, pluginType: string, pluginClass: any) {

		if (!this._mapPluginProviders[mapType]) {
			this._mapPluginProviders[mapType] = [{"pluginType": pluginType, "pluginClass": pluginClass}];
		} else {
			this._mapPluginProviders[mapType].push({"pluginType": pluginType, "pluginClass": pluginClass});
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
}
