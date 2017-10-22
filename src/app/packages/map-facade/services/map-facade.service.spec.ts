import { inject, TestBed } from '@angular/core/testing';

import { MapFacadeService } from './map-facade.service';
import { StoreModule } from '@ngrx/store';
import { ImageryModule } from '@ansyn/imagery';
import { mapFeatureKey, MapReducer } from '../reducers/map.reducer';

describe('MapFacadeService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				MapFacadeService
			],
			imports: [ImageryModule, StoreModule.forRoot({ [mapFeatureKey]: MapReducer })]
		});
	});

	it('should ...', inject([MapFacadeService], (service: MapFacadeService) => {
		expect(service).toBeTruthy();
	}));
});
