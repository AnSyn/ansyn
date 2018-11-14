import { inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { ProjectionService } from '@ansyn/imagery';
import { EffectsModule } from '@ngrx/effects';
import { AlgorithmTaskRegionVisualizer } from './algorithm-task-region.visualizer';

describe('AlgorithmTaskRegionVisualizer', () => {
	let algorithmTaskRegionVisualizer: AlgorithmTaskRegionVisualizer;
	let store: Store<any>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [AlgorithmTaskRegionVisualizer, { provide: ProjectionService, useValue: {} }],
			imports: [StoreModule.forRoot({}), EffectsModule.forRoot([])]
		});
	});

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
	}));

	beforeEach(inject([AlgorithmTaskRegionVisualizer], (_algorithmTaskRegionVisualizer: AlgorithmTaskRegionVisualizer) => {
		algorithmTaskRegionVisualizer = _algorithmTaskRegionVisualizer;
	}));

	it('should be defined', () => {
		expect(algorithmTaskRegionVisualizer).toBeDefined();
	});

});
