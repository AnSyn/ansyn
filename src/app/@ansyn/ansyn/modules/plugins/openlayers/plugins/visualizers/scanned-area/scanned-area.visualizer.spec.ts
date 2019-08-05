import { inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { ScannedAreaVisualizer } from './scanned-area.visualizer';
import { OpenLayersProjectionService } from '@ansyn/ol';

describe('ScannedAreaVisualizer', () => {
	let scannedAreaVisualizer: ScannedAreaVisualizer;
	let store: Store<any>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				ScannedAreaVisualizer,
				{ provide: OpenLayersProjectionService, useValue: {} }
			],
			imports: [
				StoreModule.forRoot({}),
				EffectsModule.forRoot([])
			]
		});
	});

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
	}));

	beforeEach(inject([ScannedAreaVisualizer], (_algorithmScannedAreaVisualizer: ScannedAreaVisualizer) => {
		scannedAreaVisualizer = _algorithmScannedAreaVisualizer;
	}));

	it('should be defined', () => {
		expect(scannedAreaVisualizer).toBeDefined();
	});

});
