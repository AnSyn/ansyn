import { inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { Actions, EffectsModule } from '@ngrx/effects';
import { MouseShadowVisualizer } from './mouse-shadow.visualizer';
import { OpenLayersProjectionService } from '@ansyn/ol';

describe('mouseShadowVisualizer', () => {
	let mouseShadowVisualizer: MouseShadowVisualizer;
	let store: Store<any>;


	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{
					provide: MouseShadowVisualizer,
					useClass: MouseShadowVisualizer,
					deps: [Actions, Store, OpenLayersProjectionService]
				},
				{ provide: OpenLayersProjectionService, useValue: {} }
			],
			imports: [StoreModule.forRoot({}), EffectsModule.forRoot([])]
		});
	});

	beforeEach(inject([Store, MouseShadowVisualizer], (_store: Store<any>, _mouseShadowVisualizer: MouseShadowVisualizer) => {
		store = _store;
		mouseShadowVisualizer = _mouseShadowVisualizer;
	}));


	it('should be created', () => {
		expect(mouseShadowVisualizer).toBeTruthy();
	});
});


