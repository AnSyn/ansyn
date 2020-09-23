import { TestBed } from '@angular/core/testing';

import { GetProvidersMapsService } from './get-providers-maps.service';
import { MAP_PROVIDERS_CONFIG } from '../../model/map-providers-config';
const MAP_PROVIDERS = {
	type1: {
		defaultMapSource: 'source1',
		sources: [
			{
				"key": "source1",
				"displayName": "source1",
				"thumbnail": "",
				"sourceType": "source1",
				"config": {}
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
		}]
	}));

	beforeEach( () => {
		service = TestBed.get(GetProvidersMapsService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('call getAllSourceForType return all sources', () => {
		const o = service.getAllSourceForType('type1');
		o.subscribe( (sources) => {
			expect(sources).toEqual(MAP_PROVIDERS['type1'].sources)
		})
	});

	it('call to getDefaultProviderByType should return the defaultMapSource', () => {
		const o = service.getDefaultProviderByType('type1');
		o.subscribe( (source) => {
			expect(source).toEqual(MAP_PROVIDERS['type1'].defaultMapSource);
		})
	});

	it('call getMapProviderByTypeAndSource should gave me the maps from the provider', () => {
		const o = service.getMapProviderByTypeAndSource('type1', 'source1');
		o.subscribe( (provider) => {
			expect(provider).toEqual(MAP_PROVIDERS['type1'].sources[0]);
		})
	});
});
