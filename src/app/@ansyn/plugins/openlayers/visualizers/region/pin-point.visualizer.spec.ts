import { inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { EffectsModule } from '@ngrx/effects';
import { PinPointVisualizer } from '@ansyn/plugins/openlayers/visualizers/region/pin-point.visualizer';

describe('PinPointVisualizer', () => {
	let pinPointVisualizer: PinPointVisualizer;
	let store: Store<any>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [PinPointVisualizer, { provide: ProjectionService, useValue: {} }],
			imports: [StoreModule.forRoot({}), EffectsModule.forRoot([])]
		});
	});

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
	}));

	beforeEach(inject([PinPointVisualizer], (_pinPointVisualizer: PinPointVisualizer) => {
		pinPointVisualizer = _pinPointVisualizer;
	}));

	it('should be defined', () => {
		expect(pinPointVisualizer).toBeDefined();
	});

});
