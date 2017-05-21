import {BaseSourceProvider} from '../models/models';
import { Injectable, Inject, InjectionToken } from '@angular/core';

export const sourceMapProviders: InjectionToken<any> = new InjectionToken('source-map-provides');

export interface IMapSourceProviderContainer{
	/**
	 * register
	 * sourceProvider : BaseSourceProvider : void
	 */
	register(sourceProvider: BaseSourceProvider): void;

	unregister(mapType: string ,sourceType: string): void;

	resolve(mapType: string ,sourceType: string): BaseSourceProvider;
}

@Injectable()
export class MapSourceProviderContainerService implements IMapSourceProviderContainer {


	private _sourceProvides: Map<string,BaseSourceProvider>;

	constructor(@Inject(BaseSourceProvider) private _sourceMapProviders: BaseSourceProvider[]) {
		this._sourceProvides = new Map<string,BaseSourceProvider>();
		if (!_sourceMapProviders) {
			console.log("Non providers were provide: Empty or undefined ");
			return;
		}
		_sourceMapProviders.forEach(sourceProvider => {
			this.register(sourceProvider);
		});
	}

	public register(sourceProvider: BaseSourceProvider): void{
		this._sourceProvides.set([sourceProvider.mapType,sourceProvider.sourceType].join(','),sourceProvider);
	}

	public unregister(mapType: string, sourceType: string): void {
		this._sourceProvides.delete([mapType,sourceType].join(','));
	}

	public resolve(mapType: string , sourceType: string): BaseSourceProvider {
		return this._sourceProvides.get([mapType,sourceType].join(','));
	}
}
