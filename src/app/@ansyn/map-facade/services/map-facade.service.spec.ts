import { inject, TestBed } from '@angular/core/testing';
import { MapFacadeService } from './map-facade.service';
import { Store, StoreModule } from '@ngrx/store';
import { ImageryCommunicatorService, ImageryModule } from '@ansyn/imagery';
import { MapReducer } from '@ansyn/map-facade';
import { IMapState, mapFeatureKey } from '@ansyn/map-facade/reducers/interfaces';

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
