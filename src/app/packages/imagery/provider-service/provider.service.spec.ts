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

	it('should register and provide a map', () => {

		const mapComponent = { Id: "test"};

		imageryProviderService.registerMapProvider("map1", mapComponent);
		imageryProviderService.registerMapProvider("map2", { Id: "test2"});

		expect(imageryProviderService.provideMap("map1")).toEqual(mapComponent);
	});

	class Plugin1 {
		Id = "test1";
	}

	class Plugin2 {
		Id = "test2";
	}

	class Plugin3 {
		Id = "test3";
	}
	it('should register and createPlugins plugins by map type', () => {

		imageryProviderService.registerPlugin("map1", "plugin1", Plugin1);
		imageryProviderService.registerPlugin("map1", "plugin2", Plugin2);
		imageryProviderService.registerPlugin("map2", "plugin3", Plugin3);

		const pluggins = imageryProviderService.createPlugins("map1");
		expect(pluggins.length).toEqual(2);
		expect((<any>pluggins[0]).Id).toEqual(new Plugin1().Id);
		expect((<any>pluggins[1]).Id).toEqual(new Plugin2().Id);
	});
});
