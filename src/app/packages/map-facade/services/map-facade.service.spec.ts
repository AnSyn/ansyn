import { inject, TestBed } from '@angular/core/testing';

import { MapFacadeService } from './map-facade.service';
import { Store, StoreModule } from '@ngrx/store';
import { ImageryCommunicatorService, ImageryModule } from '@ansyn/imagery';
import { IMapState, mapFeatureKey, MapReducer } from '../reducers/map.reducer';
import { AnnotationContextMenuTriggerAction, AnnotationDrawEndAction } from '../actions/map.actions';
import { AnnotationVisualizerAgentAction } from '@ansyn/menu-items/tools/actions/tools.actions';

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


		it('when annotations contextmenu call the trigger is dispached', () => {
			const payload: any = { hello: 'world' };
			const action = new AnnotationContextMenuTriggerAction(payload);
			service.contextMenuHandlerSubscriber(payload);
			expect(store.dispatch).toHaveBeenCalledTimes(1);
			expect(store.dispatch).toHaveBeenCalledWith(action);
		});

		it('drawEndSubscriber event', () => {
			service.drawEndSubscriber(<any>'some GeoJsonObject');
			expect(store.dispatch).toHaveBeenCalledWith(new AnnotationDrawEndAction(<any>'some GeoJsonObject'));

		});
	});

});
