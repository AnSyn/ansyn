import { Injectable, Inject } from '@angular/core';
import { IMapProvidersConfig, MAP_PROVIDERS_CONFIG } from '../../model/map-providers-config';
import { of, Observable, EMPTY, from } from 'rxjs';
import { BaseMapSourceProvider } from '../../model/base-map-source-provider';
import { IImageryMapSources } from '../../providers/map-source-providers';
import { IBaseImageryLayer } from '../../model/imagery-layer.model';
import { IMapSettings } from '../../model/map-settings';
import { mergeMap, catchError, map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class GetProvidersMapsService {
	constructor(@Inject(MAP_PROVIDERS_CONFIG) protected mapProvidersConfig: IMapProvidersConfig,
				@Inject(BaseMapSourceProvider) protected imageryMapSources: IImageryMapSources) {}

	getAllSourceForType(type): Observable<any> {
		return of(this.mapProvidersConfig[type].sources);
	}

	getDefaultProviderByType(type): Observable<any> {
		return of(this.mapProvidersConfig[type] && this.mapProvidersConfig[type].defaultMapSource);
	}


	getMapProviderByTypeAndSource(type, sourceType): Observable<any> {
		return of(this.mapProvidersConfig[type].sources.find(source => source.key === sourceType))
	}

	createMapSourceForMapType(mapType: string, sourceType: string, mapSettings: IMapSettings): Observable<IBaseImageryLayer> {
		return this.getMapProviderByTypeAndSource(mapType, sourceType).pipe(
			map( (mapSource) => [mapSource, this.getMapSourceProvider(mapType, mapSource.sourceType)]),
			mergeMap( ([mapSource, sourceProvider]: [any, BaseMapSourceProvider]) => from(
				sourceProvider.createAsync({
					...mapSettings,
					worldView: {...mapSettings.worldView, sourceType: mapSource.sourceType},
					data: {...mapSettings.data, config: mapSource.config, key: mapSource.key}
				}))
			),
			catchError( (error) => {
				console.error(error);
				return EMPTY;
			})
		)
	}

	getMapSourceProvider( mapType: string, sourceType: string): BaseMapSourceProvider {
		return this.imageryMapSources[mapType][sourceType];
	}
}
