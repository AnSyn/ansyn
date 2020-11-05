import { TestBed } from '@angular/core/testing';

import { GetProvidersMapsService } from './get-providers-maps.service';
import { MAP_PROVIDERS_CONFIG } from '../../model/map-providers-config';
import { BaseMapSourceProvider, MAP_SOURCE_PROVIDERS_CONFIG } from '../../model/base-map-source-provider';
import { ImageryMapSource } from '../../decorators/map-source-provider';
import { IMapSettings } from '../../model/map-settings';
import { IBaseImageryLayer } from '../../model/imagery-layer.model';
import { CacheService } from '../../cache-service/cache.service';
import { ImageryCommunicatorService } from '../../communicator-service/communicator.service';
import { IBaseImageryMapConstructor } from '../../model/base-imagery-map';
import { of } from 'rxjs';

const mapType = 'mapType1';
const sourceType = 'source1';

class MockLayer implements IBaseImageryLayer {
	get(key: any): any {
	}

	set(key: any, value: any): void {
	}

}

@ImageryMapSource({
	sourceType: sourceType,
	supported: <any>[mapType]
})
class MockMapProvider extends BaseMapSourceProvider {
	readonly supported: IBaseImageryMapConstructor[] = [];
	constructor() {
		super(null, null, null);
	}
	create<META extends IMapSettings>(metaData: META): Promise<IBaseImageryLayer> {
		return Promise.resolve(MockLayer as unknown as IBaseImageryLayer);
	}

	createAsync<META extends IMapSettings>(metaData: META): Promise<IBaseImageryLayer> {
		return this.create(metaData)
	}
}

const MAP_PROVIDERS = {
	[mapType]: {
		defaultMapSource: sourceType,
		sources: [
			{
				'key': sourceType,
				'displayName': 'source1',
				'thumbnail': '',
				'sourceType': sourceType,
				'config': {}
			}
		]
	}
};
describe('GetProvidersMapsService', () => {
	let service: GetProvidersMapsService;
	beforeEach(() => TestBed.configureTestingModule({
		providers: [{
			provide: MAP_PROVIDERS_CONFIG,
			useValue: MAP_PROVIDERS
		},
			{
				provide: BaseMapSourceProvider,
				useValue: {
					[mapType]: {
						[sourceType]: MockMapProvider
					}
				}
			},
			{
				provide: CacheService,
				useValue: {}
			},
			{
				provide: ImageryCommunicatorService,
				useValue: {}
			},
			{
				provide: MAP_SOURCE_PROVIDERS_CONFIG,
				useValue: {}
			}]
	}));

	beforeEach(() => {
		service = TestBed.inject(GetProvidersMapsService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('call getAllSourceForType return all sources', () => {
		const o = service.getAllSourceForType(mapType);
		o.subscribe((sources) => {
			expect(sources).toEqual(MAP_PROVIDERS[mapType].sources)
		})
	});

	it('call to getDefaultProviderByType should return the defaultMapSource', () => {
		const o = service.getDefaultProviderByType(mapType);
		o.subscribe((source) => {
			expect(source).toEqual(MAP_PROVIDERS[mapType].defaultMapSource);
		})
	});

	it('call getMapProviderByTypeAndSource should gave me the maps from the provider', () => {
		const o = service.getMapProviderByTypeAndSource(mapType, sourceType);
		o.subscribe((provider) => {
			expect(provider).toEqual(MAP_PROVIDERS[mapType].sources[0]);
		})
	});

	it('call createMapSourceForMapType return should return MockLayer', () => {
		spyOn(service, 'createMapSourceForMapType').and.callFake((m,s) => of(new MockLayer()))
		const o = service.createMapSourceForMapType(mapType, sourceType);
		o.subscribe((layer) => {
			expect(layer instanceof MockLayer).toBeTruthy();
		})
	});

	it('call getMapSourceProvider return the MockMapProvider', () => {
		spyOn(service, 'getMapSourceProvider').and.callFake((m,s) => new MockMapProvider())
		const o = service.getMapSourceProvider(mapType, sourceType);
		console.log(`getMapSourceProvider`, {o});
		expect(o instanceof MockMapProvider).toBeTruthy();
	});
});
