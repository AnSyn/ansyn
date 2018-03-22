import { async, inject, TestBed } from '@angular/core/testing';
import { ImageryProviderService } from './imagery-provider.service';
import { VisualizersConfig } from '@ansyn/core/tokens/visualizers-config.token';

describe('ImageryProviderService', () => {
	let imageryProviderService: ImageryProviderService;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [],
			providers: [
				ImageryProviderService,
				{ provide: VisualizersConfig, useValue: {} }
			]
		}).compileComponents();
	}));

	beforeEach(inject([ImageryProviderService], (_ImageryProviderService) => {
		imageryProviderService = _ImageryProviderService;
	}));

	it('should create "ImageryProviderService" service', () => {
		expect(ImageryProviderService).toBeTruthy();
	});

	it('ImageryProviderService should registerMapProvider and provideMap by map type', () => {

		const mapComponent = { id: 'test' };

		imageryProviderService.registerMapProvider('map1', 'map1', mapComponent);
		imageryProviderService.registerMapProvider('map2', 'map2', { id: 'test2' });

		expect(imageryProviderService.provideMap('map1')).toEqual({ mapType: 'map1', mapComponent: mapComponent });
	});

});
