import { inject, TestBed } from '@angular/core/testing';
import { MapFacadeService } from './map-facade.service';
import { Store, StoreModule } from '@ngrx/store';
import { IMapState, mapFeatureKey, MapReducer } from '../reducers/map.reducer';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { ImageryModule } from '@ansyn/imagery/imagery.module';

describe('MapFacadeService', () => {
	let service: MapFacadeService;
	let store: Store<IMapState>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				MapFacadeService,
				ImageryCommunicatorService
			],
			imports: [ImageryModule, StoreModule.forRoot({ [mapFeatureKey]: MapReducer })]
		});
	});

	beforeEach(inject([MapFacadeService, Store], (_mapFacadeService: MapFacadeService, _store: Store<IMapState>) => {
		service = _mapFacadeService;
		store = _store;
	}));

	it('service is initilaized', () => {
		expect(service).toBeTruthy();
	});

	describe('check all dispatch events', () => {

		beforeEach(() => {
			spyOn(store, 'dispatch');
		});

	});

});
