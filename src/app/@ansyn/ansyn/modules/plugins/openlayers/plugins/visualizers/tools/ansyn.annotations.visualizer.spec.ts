import { inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { OL_PLUGINS_CONFIG, OpenLayersProjectionService } from '@ansyn/ol';
import { AnsynAnnotationsVisualizer } from './ansyn.annotations.visualizer';
import { VisualizersConfig } from '@ansyn/imagery';

describe('AnsynAnnotationsVisualizer', () => {
	let ansynAnnotationsVisualizer: AnsynAnnotationsVisualizer;
	let store: Store<any>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({})
			],
			providers: [
				{
					provide: AnsynAnnotationsVisualizer,
					useClass: AnsynAnnotationsVisualizer,
					deps: [Store, Actions, OpenLayersProjectionService, OL_PLUGINS_CONFIG, VisualizersConfig]
				},
				Store,
				Actions,
				{ provide: OpenLayersProjectionService, useValue: {} },
				{ provide: OL_PLUGINS_CONFIG, useValue: {} },
				{ provide: VisualizersConfig, useValue: {} }
			]
		});
	});

	beforeEach(inject([Store, AnsynAnnotationsVisualizer], (_store: Store<any>, _ansynAnnotationsVisualizer: AnsynAnnotationsVisualizer) => {
		store = _store;
		ansynAnnotationsVisualizer = _ansynAnnotationsVisualizer;
	}));


	it('should be created', () => {
		expect(ansynAnnotationsVisualizer).toBeTruthy();
	});
});


