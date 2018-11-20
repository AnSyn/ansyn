import { OpenLayersDisabledMap, OpenLayersMap } from '@ansyn/plugins';
import { CacheService, ImageryCommunicatorService, ImageryMapSource } from '@ansyn/imagery';
import { OpenLayersMapSourceProvider } from './open-layers.map-source-provider';
import { ICaseMapState } from '@ansyn/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Inject } from '@angular/core';
import { TBSourceProvider } from '../overlay-source-providers/tb/tb-source-provider';
import { ITBOverlaySourceConfig } from '../overlay-source-providers/tb/tb.model';
import { IMapSourceProvidersConfig, MAP_SOURCE_PROVIDERS_CONFIG } from './map-source-providers-config';
import { catchError } from 'rxjs/operators';

export const OpenLayerTBSourceProviderSourceType = 'TB';

@ImageryMapSource({
	sourceType: OpenLayerTBSourceProviderSourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap]
})
export class OpenLayerTBSourceProvider extends OpenLayersMapSourceProvider {
	constructor(
		protected cacheService: CacheService,
		protected imageryCommunicatorService: ImageryCommunicatorService,
		@Inject(MAP_SOURCE_PROVIDERS_CONFIG) protected config: IMapSourceProvidersConfig,
		@Inject(TBSourceProvider) protected tbConfig: ITBOverlaySourceConfig,
		protected http: HttpClient) {
		super(cacheService, imageryCommunicatorService, config)
	}

	createAsync(metaData: ICaseMapState): Promise<any> {
		return Promise.resolve(null);
	}

	getThumbnailUrl(overlay, position): Observable<string> {
		console.log('getThumbnailUrl? TB')
		return this.http.get<string>(`${this.tbConfig.baseUrl}/layers/${overlay.id}/thumbnail`).pipe(
			catchError(() => of(''))
		)
	}
}
