/**
 * Created by AsafMas on 08/05/2017.
 */

import { async, inject, TestBed } from '@angular/core/testing';
import { ImageryProviderService } from './provider.service';

describe('ImageryProviderService', () => {
	let imageryProviderService: ImageryProviderService;

	beforeEach(async(() => {
		TestBed.configureTestingModule({declarations: [], providers: [ ImageryProviderService]}).compileComponents();
	}));

	beforeEach(inject([ImageryProviderService], (_ImageryProviderService) => {
		imageryProviderService = _ImageryProviderService;
	}));

	it('should create "ImageryProviderService" service', () => {
		expect(ImageryProviderService).toBeTruthy();
	});

	it('ImageryProviderService should registerMapProvider and provideMap by map type', () => {

		const mapComponent = { id: "test"};

		imageryProviderService.registerMapProvider("map1", mapComponent);
		imageryProviderService.registerMapProvider("map2", { id: "test2"});

		expect(imageryProviderService.provideMap("map1")).toEqual(mapComponent);
	});

	class Plugin1 {
		id = "test1";
	}

	class Plugin2 {
		id = "test2";
	}

	class Plugin3 {
		id = "test3";
	}
	it('ImageryProviderService should registerPlugin and createPlugins by map type', () => {

		imageryProviderService.registerPlugin("map1", "plugin1", Plugin1);
		imageryProviderService.registerPlugin("map1", "plugin2", Plugin2);
		imageryProviderService.registerPlugin("map2", "plugin3", Plugin3);

		const pluggins = imageryProviderService.createPlugins("map1");
		expect(pluggins.length).toEqual(2);
		expect((<any>pluggins[0]).id).toEqual(new Plugin1().id);
		expect((<any>pluggins[1]).id).toEqual(new Plugin2().id);
	});
});
