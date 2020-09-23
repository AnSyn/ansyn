import { Injectable, Inject } from '@angular/core';
import { IMapProvidersConfig, MAP_PROVIDERS_CONFIG } from '../../model/map-providers-config';
import { of, Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class GetProvidersMapsService {
	constructor(@Inject(MAP_PROVIDERS_CONFIG) protected mapProvidersConfig: IMapProvidersConfig) {}

	getAllSourceForType(type): Observable<any> {
		return of(this.mapProvidersConfig[type].sources);
	}

	getDefaultProviderByType(type): Observable<any> {
		return of(this.mapProvidersConfig[type] && this.mapProvidersConfig[type].defaultMapSource);
	}


	getMapProviderByTypeAndSource(type, sourceType): Observable<any> {
		return of(this.mapProvidersConfig[type].sources.find(source => source.key === sourceType))
	}
}
