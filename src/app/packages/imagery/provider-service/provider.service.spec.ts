import { async, inject, TestBed } from '@angular/core/testing';
import { ImageryProviderService } from './provider.service';

describe('ImageryProviderService', () => {
	let imageryProviderService: ImageryProviderService;

	beforeEach(async(() => {
		TestBed.configureTestingModule({ declarations: [], providers: [ImageryProviderService] }).compileComponents();
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

	class Plugin1 {
		id = 'test1';
	}

	class Plugin2 {
		id = 'test2';
	}

	class Plugin3 {
		id = 'test3';
	}

	it('ImageryProviderService should registerPlugin and createPlugins by map type', () => {

		imageryProviderService.registerPlugin('map1', Plugin1);
		imageryProviderService.registerPlugin('map1', Plugin2);
		imageryProviderService.registerPlugin('map2', Plugin3);

		const plugins = imageryProviderService.createPlugins('map1');
		expect(plugins.length).toEqual(2);
		expect((<any>plugins[0]).id).toEqual(new Plugin1().id);
		expect((<any>plugins[1]).id).toEqual(new Plugin2().id);
	});

	it('ImageryProviderService should registerVisualizer and getVisualizersConfig by map type', () => {

		imageryProviderService.registerVisualizer('map1', Plugin1);
		imageryProviderService.registerVisualizer('map1', Plugin2, 'arg1');
		imageryProviderService.registerVisualizer('map2', Plugin3);

		const plugins = imageryProviderService.getVisualizersConfig('map1');
		expect(plugins.length).toEqual(2);
		// {visualizerClass: visualizerClass, args: constructorArgs}
		expect((<any>plugins[0]).visualizerClass).toEqual(Plugin1);
		expect((<any>plugins[1]).visualizerClass).toEqual(Plugin2);
		expect((<any>plugins[1]).args).toEqual('arg1');
	});
});
