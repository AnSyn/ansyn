import { inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { PinPointVisualizer } from './pin-point.visualizer';
import { OpenLayersProjectionService } from '@ansyn/imagery-ol';

describe('PinPointVisualizer', () => {
	let pinPointVisualizer: PinPointVisualizer;
	let store: Store<any>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				PinPointVisualizer,
				{ provide: OpenLayersProjectionService, useValue: {} },
				Actions
			],
			imports: [StoreModule.forRoot({})]
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
