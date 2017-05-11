import {MapSourceProviderContainerService,sourceMapProviders} from './map-source-provider-container.service';
import { TestBed, inject } from '@angular/core/testing';
import { ISourceProvider} from '../models/models';

class SourceProviderMock implements ISourceProvider {
    mapType: string;
    sourceType: string;
    
    constructor(mapType: string, sourceType : string){
        this.mapType = mapType;
        this.sourceType = sourceType;
    }

    create(metaData: any) : any {
        return true;
    }
    
}

describe('MapSourceProviderContainer', () => {
	let mapSourceProviderContainer: MapSourceProviderContainerService;
    let sourceProviders : ISourceProvider[] = [
        new SourceProviderMock('mapType1','sourceType1'),
        new SourceProviderMock('mapType2','sourceType2')
    ];

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
                MapSourceProviderContainerService,
                {provide: sourceMapProviders , useValue: sourceProviders}
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
    }) 

    it('should resolve SourceProvider1',() => {
        expect(mapSourceProviderContainer.
        resolve('mapType1','sourceType1')).
        toEqual(sourceProviders[0]);
    })

    it('should register new SourceProvider',() => {
        let expectedValue = new SourceProviderMock('mapType3','sourceType3');
        mapSourceProviderContainer.register(expectedValue);
        expect(mapSourceProviderContainer.
        resolve('mapType3','sourceType3')).
        toEqual(expectedValue);
    } )

    it('should remove SourceProvider',()=>{
        mapSourceProviderContainer.unregister('mapType1','sourceType1');
        expect(mapSourceProviderContainer.
        resolve('mapType1','sourceType1')).
        toBeUndefined();
    })

});
