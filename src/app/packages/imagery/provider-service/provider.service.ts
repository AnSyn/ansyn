import { Injectable } from '@angular/core';
<<<<<<< HEAD:src/app/packages/imagery/provider-service/provider.service.ts
import { IMapPlugin } from '../model/imap-plugin';
import { CommunicatorEntity } from '../communicator-service/communicator.entity';
=======
import { IMapPlugin } from '../model/model';
import { ImageryCommunicator } from '../api/imageryCommunicator';
>>>>>>> create shadow mouse with the sandbox:src/app/packages/imagery/imageryProviderService/imageryProvider.service.ts
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

<<<<<<< HEAD:src/app/packages/imagery/provider-service/provider.service.ts
	public createPlugins(mapType: string, imageryCommunicator: CommunicatorEntity): IMapPlugin[] {
=======
	public createPlugins(mapType: string, imageryCommunicator: ImageryCommunicator): IMapPlugin[] {
>>>>>>> create shadow mouse with the sandbox:src/app/packages/imagery/imageryProviderService/imageryProvider.service.ts
		const mapPluginProviders = this._mapPluginProviders[mapType];
		if (!mapPluginProviders) {
			return null;
		}

		const plugins: IMapPlugin[] = [];
		mapPluginProviders.forEach(provider => {
			const providedPlugin: IMapPlugin = new provider.pluginClass();
			providedPlugin.init(imageryCommunicator);
			plugins.push(providedPlugin);
		});

		return plugins;
	}
}
