import { Injectable, Inject } from '@angular/core';
import { IMapProvidersConfig, MAP_PROVIDERS_CONFIG } from '../../model/map-providers-config';
import { of, Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class GetProvidersMapsService {
	constructor(@Inject(MAP_PROVIDERS_CONFIG) protected mapProvidersConfig: IMapProvidersConfig) {
		mapProvidersConfig.someOtherProvider = {defaultMapSource: 'sdsd', sources: []};
		console.log('init service')
	}

	getAllSourceForType(type): Observable<any> {
		return of(this.mapProvidersConfig[type].sources);
	}

	getDefaultProviderByType(type): Observable<any> {
		return of(this.mapProvidersConfig[type] && this.mapProvidersConfig[type].defaultMapSource);
	}


	getMapProviderByTypeAndSource(type, source): Observable<any> {
		return of(this.mapProvidersConfig[type][source])
	}
}
