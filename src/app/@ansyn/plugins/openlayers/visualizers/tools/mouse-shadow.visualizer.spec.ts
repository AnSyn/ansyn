import { inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { ProjectionService } from '@ansyn/imagery';
import { Actions, EffectsModule } from '@ngrx/effects';
import { MouseShadowVisualizer } from './mouse-shadow.visualizer';

describe('mouseShadowVisualizer', () => {
	let mouseShadowVisualizer: MouseShadowVisualizer;
	let store: Store<any>;


	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{
					provide: MouseShadowVisualizer,
					useClass: MouseShadowVisualizer,
					deps: [Actions, Store, ProjectionService]
				},
				{ provide: ProjectionService, useValue: {} }
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


