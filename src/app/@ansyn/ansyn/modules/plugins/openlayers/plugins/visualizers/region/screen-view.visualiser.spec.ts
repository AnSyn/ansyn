import { inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { PolygonSearchVisualizer as ScreenViewSearchVisualizer } from './polygon-search.visualizer';
import { OpenLayersProjectionService } from '@ansyn/ol';

describe('screenViewSearchVisualizer', () => {
	let screenViewSearchVisualizer: ScreenViewSearchVisualizer;
	let store: Store<any>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [ScreenViewSearchVisualizer, { provide: OpenLayersProjectionService, useValue: {} }],
			imports: [StoreModule.forRoot({}), EffectsModule.forRoot([])]
		});
	});

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
	}));

	beforeEach(inject([ScreenViewSearchVisualizer], (_screenViewSearchVisualizer: ScreenViewSearchVisualizer) => {
		screenViewSearchVisualizer = _screenViewSearchVisualizer;
	}));
});
