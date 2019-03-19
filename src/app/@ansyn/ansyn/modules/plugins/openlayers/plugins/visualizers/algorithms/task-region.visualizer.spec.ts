import { inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { TaskRegionVisualizer } from './task-region.visualizer';
import { TasksService } from '../../../../../menu-items/public_api';
import { OpenLayersProjectionService } from '../../../projection/open-layers-projection.service';

describe('TaskRegionVisualizer', () => {
	let algorithmTaskRegionVisualizer: TaskRegionVisualizer;
	let store: Store<any>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				TaskRegionVisualizer,
				{ provide: OpenLayersProjectionService, useValue: {} },
				{ provide: TasksService, useValue: {} }
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

	beforeEach(inject([TaskRegionVisualizer], (_algorithmTaskRegionVisualizer: TaskRegionVisualizer) => {
		algorithmTaskRegionVisualizer = _algorithmTaskRegionVisualizer;
	}));

	it('should be defined', () => {
		expect(algorithmTaskRegionVisualizer).toBeDefined();
	});

});
