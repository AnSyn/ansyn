import { inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { ProjectionService } from '@ansyn/imagery';
import { EffectsModule } from '@ngrx/effects';
import { TaskRegionVisualizer } from './task-region.visualizer';

describe('TaskRegionVisualizer', () => {
	let algorithmTaskRegionVisualizer: TaskRegionVisualizer;
	let store: Store<any>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [TaskRegionVisualizer, { provide: ProjectionService, useValue: {} }],
			imports: [StoreModule.forRoot({}), EffectsModule.forRoot([])]
		});
	});

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
	}));

	beforeEach(inject([TaskRegionVisualizer], (_algorithmTaskRegionVisualizer: TaskRegionVisualizer) => {
		algorithmTaskRegionVisualizer = _algorithmTaskRegionVisualizer;
	}));

	it('should be defined', () => {
		expect(algorithmTaskRegionVisualizer).toBeDefined();
	});

});
