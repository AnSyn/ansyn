import { Injectable } from '@angular/core';
import { IMapPlugin } from '../model/model';
import { IImageryCommunicator } from '../api/imageryCommunicator';
/**
 * Created by AsafMasa on 24/04/2017.
 */

@Injectable()
export class ImageryProviderService {

	private _mapProviders: { [id: string]: any };
	private _mapStatesProviders: { [id: string]: any };

	constructor() {
		this._mapProviders = {};
		this._mapStatesProviders = {};
	}

	public registerMapProvider(mapType: string, component: any) {
		if (this._mapProviders[mapType]) {
			throw new Error(`'Map Provider ${mapType} is already registered.'`);
		}

		this._mapProviders[mapType] = component;
	}

	public registerMapStateProvider(mapState: string, mapStateCreateMethod: any) {
		if (this._mapStatesProviders[mapState]) {
			throw new Error(`'Map State Provider ${mapState} is already registered.'`);
		}
		this._mapStatesProviders[mapState] = mapStateCreateMethod;
	}

	public provideMap(mapType: string): any {
		if (!this._mapProviders[mapType]) {
			throw new Error(`'Map Provider ${mapType} doesn't exist.'`);
		}

		const providedMap = this._mapProviders[mapType];
		return providedMap;
	}

	public createMapState(mapState: string, imageryCommunicator: IImageryCommunicator): IMapPlugin {
		const mapStateObject = this.provideMapState(mapState);
		mapStateObject.setImageryCommunicator(imageryCommunicator);
		return mapStateObject;
	}

	private provideMapState(mapState: string): IMapPlugin {
		if (!this._mapStatesProviders[mapState]) {
			throw new Error(`'Map State Provider ${mapState} doesn't exist.'`);
		}

		const providedState = new this._mapStatesProviders[mapState](mapState);
		return providedState;
	}
}
