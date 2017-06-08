import {SourceFacadeContainerService} from './overlay-source-facade-container.service';
import { TestBed, inject } from '@angular/core/testing';
import { BaseOverlayDataSourceFacade} from '../models/base-overlay-source-facade.model';
import { BaseDataSourceFacade } from "../models/base-data-source-facade.model";


class SourceProviderMock1 extends BaseOverlayDataSourceFacade {
    get(query: any): any {
        return {
            id : "123456"
        }
    }
	
    sourceType = 'sourceType1';
}

class SourceProviderMock2 extends BaseOverlayDataSourceFacade {
	 get(query: any): any {
        return {
            id : "654321"
        }
    }

    sourceType = 'sourceType2';
	
}

class SourceProviderMock3 extends BaseOverlayDataSourceFacade {
	get(query: any): any {
        return {
            id : "162534"
        }
    }
    sourceType = 'sourceType3';
}

describe('SourceFacadeContainerService', () => {
	let sourceFacadeContainerService: SourceFacadeContainerService;
	let sourceProviders: BaseOverlayDataSourceFacade[] = [
		new SourceProviderMock1(),
		new SourceProviderMock2()
	];

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers:[
				SourceFacadeContainerService,
				{ provide: BaseDataSourceFacade , useClass: SourceProviderMock1, multi:true},
				{ provide: BaseDataSourceFacade , useClass: SourceProviderMock2, multi:true}
			]
		});
	});

	beforeEach(
		inject([SourceFacadeContainerService],
			(_sourceFacadeContainerService: SourceFacadeContainerService) => {
				sourceFacadeContainerService = _sourceFacadeContainerService;
			}));

	it('should be defined', () => {
		expect(sourceFacadeContainerService).toBeDefined();
	});

	it('should have two ISourceProviders', () =>{
		expect(sourceFacadeContainerService['_sourceFacades'].size).toEqual(1);
	});

	it('should resolve SourceProvider1',() => {
		expect(sourceFacadeContainerService.
		resolve(BaseOverlayDataSourceFacade,'sourceType1')[0]).
		toEqual(sourceProviders[0]);
	});

	it('should register new SourceProvider',() => {
		let expectedValue = new SourceProviderMock3();
		sourceFacadeContainerService.register(BaseOverlayDataSourceFacade,expectedValue);
		expect(sourceFacadeContainerService.
		resolve(BaseOverlayDataSourceFacade,expectedValue.sourceType)[0]).
		toEqual(expectedValue);
	});

	it('should remove SourceProvider',()=>{
		sourceFacadeContainerService.unregister(BaseOverlayDataSourceFacade,'sourceType1');
		expect(sourceFacadeContainerService.
		resolve(BaseOverlayDataSourceFacade,'sourceType1').length).toEqual(0)
	});

	it('should resolve all source providers',() => {
		expect(sourceFacadeContainerService.resolve(BaseOverlayDataSourceFacade).length).toEqual(2);
	})

});
