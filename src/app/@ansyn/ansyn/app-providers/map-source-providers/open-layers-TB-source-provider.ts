import { OpenLayersDisabledMap, OpenLayersMap } from '@ansyn/plugins';
import { CacheService, ImageryCommunicatorService, ImageryMapSource } from '@ansyn/imagery';
import { OpenLayersMapSourceProvider } from './open-layers.map-source-provider';
import { ICaseMapState } from '@ansyn/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Inject } from '@angular/core';
import { ITBConfig } from '../overlay-source-providers/tb/tb.model';
import { IMapSourceProvidersConfig, MAP_SOURCE_PROVIDERS_CONFIG } from '@ansyn/core';
import { catchError } from 'rxjs/operators';

export const OpenLayerTBSourceProviderSourceType = 'TB';

@ImageryMapSource({
	sourceType: OpenLayerTBSourceProviderSourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap],
	forOverlay: true
})
export class OpenLayerTBSourceProvider extends OpenLayersMapSourceProvider<ITBConfig> {

	constructor(
		protected cacheService: CacheService,
		protected imageryCommunicatorService: ImageryCommunicatorService,
		@Inject(MAP_SOURCE_PROVIDERS_CONFIG) protected mapSourceProvidersConfig: IMapSourceProvidersConfig,
		protected http: HttpClient) {
		super(cacheService, imageryCommunicatorService, mapSourceProvidersConfig);
	}

	createAsync(metaData: ICaseMapState): Promise<any> {
		return Promise.resolve(null);
	}

	getThumbnailUrl(overlay, position): Observable<string> {
		console.log('getThumbnailUrl? TB');
		return this.http.get<string>(`${this.config.baseUrl}/layers/${overlay.id}/thumbnail`).pipe(
			catchError(() => of(''))
		);
	}
}
