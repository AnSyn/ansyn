import {MapSourceProviderContainerService,sourceMapProviders} from './map-source-provider-container.service';
import { TestBed, inject } from '@angular/core/testing';
import { BaseSourceProvider} from '../models/models';

class SourceProviderMock1 implements BaseSourceProvider {
	mapType= 'mapType1';
	sourceType = 'sourceType1';

	create(metaData: any): any {
		return true;
	}
}

class SourceProviderMock2 implements BaseSourceProvider {
	mapType= 'mapType2';
	sourceType = 'sourceType2';

	create(metaData: any): any {
		return true;
	}

}

class SourceProviderMock3 implements BaseSourceProvider {
	mapType= 'mapType3';
	sourceType = 'sourceType3';

	create(metaData: any): any {
		return true;
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
			providers:[
				MapSourceProviderContainerService,
				{ provide: BaseSourceProvider , useClass: SourceProviderMock1, multi:true},
				{ provide: BaseSourceProvider , useClass: SourceProviderMock2, multi:true}
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
