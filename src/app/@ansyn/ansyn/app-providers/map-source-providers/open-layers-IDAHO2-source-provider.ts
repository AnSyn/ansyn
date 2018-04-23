import { Injectable } from '@angular/core';
import { OpenLayerIDAHOSourceProvider } from './open-layers-IDAHO-source-provider';
import { CacheService } from '@ansyn/imagery/cache-service/cache.service';
import { Store } from '@ngrx/store';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';

export const OpenLayerIDAHO2SourceProviderSourceType = 'IDAHO2';

// TODO: Remove "OpenLayerIDAHO2SourceProvider" when new valid source provider is added
@Injectable()
export class OpenLayerIDAHO2SourceProvider extends OpenLayerIDAHOSourceProvider {
	public sourceType = OpenLayerIDAHO2SourceProviderSourceType;

	constructor(protected store: Store<any>, protected cacheService: CacheService,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
		super(store, cacheService, imageryCommunicatorService)
	}
}
