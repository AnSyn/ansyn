import {MapSourceProviderContainerService,sourceMapProviders} from './services/map-source-provider-container.service';
import { TestBed, inject } from '@angular/core/testing';
import { BaseSourceProvider} from './models/models';
import { MapSourceProviderModule } from "./map-source-provider.module";

class SourceProviderMock1 implements BaseSourceProvider {
	mapType= 'mapType1';
	sourceType = 'sourceType1';

	create(metaData: any): any {
		return true;
	}

	createAsync(metaData: any): Promise<any> {
		return Promise.resolve();
	}
}

class SourceProviderMock2 implements BaseSourceProvider {
	mapType= 'mapType2';
	sourceType = 'sourceType2';

	create(metaData: any): any {
		return true;
	}

	createAsync(metaData: any): Promise<any> {
		return Promise.resolve();
	}
}

class SourceProviderMock3 implements BaseSourceProvider {
	mapType= 'mapType3';
	sourceType = 'sourceType3';

	create(metaData: any): any {
		return true;
	}

	createAsync(metaData: any): Promise<any> {
		return Promise.resolve();
	}
}

describe('MapSourceProviderContainer', () => {
	let mapSourceProviderContainer: MapSourceProviderContainerService;
	let sourceProviders: BaseSourceProvider[] = [
		new SourceProviderMock1(),
		new SourceProviderMock2()
	];

	beforeEach(() => {
		TestBed.configureTestingModule({
            imports : [
                MapSourceProviderModule.register(SourceProviderMock1),
                MapSourceProviderModule.register(SourceProviderMock2),
            ],
			providers:[
				MapSourceProviderContainerService
			]
		});
	});

	beforeEach(
		inject([MapSourceProviderContainerService],
			(_mapSourceProviderContainer: MapSourceProviderContainerService) => {
				mapSourceProviderContainer = _mapSourceProviderContainer;
			}));

	it('should be defined', () => {
		expect(mapSourceProviderContainer).toBeDefined();
	});

	it('should have two ISourceProviders', () =>{
		expect(mapSourceProviderContainer['_sourceProvides'].size).toEqual(2);
	});

	it('should resolve SourceProvider1',() => {
		expect(mapSourceProviderContainer.
		resolve('mapType1','sourceType1')).
		toEqual(sourceProviders[0]);
	});

	it('should register new SourceProvider',() => {
		let expectedValue = new SourceProviderMock3();
		mapSourceProviderContainer.register(expectedValue);
		expect(mapSourceProviderContainer.
		resolve('mapType3','sourceType3')).
		toEqual(expectedValue);
	});

	it('should remove SourceProvider',()=>{
		mapSourceProviderContainer.unregister('mapType1','sourceType1');
		expect(mapSourceProviderContainer.
		resolve('mapType1','sourceType1')).
		toBeUndefined();
	});

});
