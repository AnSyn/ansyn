import { BaseMapSourceProvider } from '@ansyn/imagery/model/base-map-source-provider';
import { OpenlayersMapName } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { DisabledOpenLayersMapName } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-disabled-map/openlayers-disabled-map';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { CacheService } from '@ansyn/imagery/cache-service/cache.service';
import { Inject } from '@angular/core';
import {
	IMapSourceProvidersConfig,
	MAP_SOURCE_PROVIDERS_CONFIG
} from '@ansyn/ansyn/app-providers/map-source-providers/map-source-providers-config';

export abstract class OpenLayersMapSourceProvider extends BaseMapSourceProvider {
	supported = [OpenlayersMapName, DisabledOpenLayersMapName];
	constructor(protected cacheService: CacheService,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				@Inject(MAP_SOURCE_PROVIDERS_CONFIG) protected config: IMapSourceProvidersConfig) {
		super(cacheService, imageryCommunicatorService);
	}
}
