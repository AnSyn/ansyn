import { inject, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { of } from 'rxjs/index';
import { featureCollection } from '@turf/turf';
import { AnsynAnnotationsVisualizer } from './ansyn.annotations.visualizer';
import { OpenLayersProjectionService } from '@ansyn/ol';
import { toolsConfig } from '../../../../../menu-items/tools/models/tools-config';

describe('AnsynAnnotationsVisualizer', () => {
	let AnsynAnnotationsVisualizer: AnsynAnnotationsVisualizer;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [AnsynAnnotationsVisualizer, {
				provide: OpenLayersProjectionService,
				useValue: { projectCollectionAccurately: of(true) }
			}, { provide: toolsConfig, useValue: { Annotations: { displayId: true } } }],
			imports: [StoreModule.forRoot({})]
		});
	});

	beforeEach(inject([AnsynAnnotationsVisualizer], (_AnsynAnnotationsVisualizer: AnsynAnnotationsVisualizer) => {
		AnsynAnnotationsVisualizer = _AnsynAnnotationsVisualizer;
	}));

	it('should be created', () => {
		expect(AnsynAnnotationsVisualizer).toBeTruthy();
	});

	it('onDipsose should call removeDrawInteraction', () => {
		spyOn(AnsynAnnotationsVisualizer, 'removeDrawInteraction');
		AnsynAnnotationsVisualizer.onDispose();
		expect(AnsynAnnotationsVisualizer.removeDrawInteraction).toHaveBeenCalled();
	});

	it('resetInteractions should call removeInteraction, addInteraction', () => {
		spyOn(AnsynAnnotationsVisualizer, 'addInteraction');
		spyOn(AnsynAnnotationsVisualizer, 'removeInteraction');
		AnsynAnnotationsVisualizer.resetInteractions();
		expect(AnsynAnnotationsVisualizer.addInteraction).toHaveBeenCalled();
		expect(AnsynAnnotationsVisualizer.removeInteraction).toHaveBeenCalled();
	});

	describe('onAnnotationsChange should call removeInteraction, addInteraction', () => {

		it('should call showAnnotation features collection', () => {
			spyOn(AnsynAnnotationsVisualizer, 'showAnnotation');
			AnsynAnnotationsVisualizer.onAnnotationsChange([{}, false, [], true, '']);
			expect(AnsynAnnotationsVisualizer.showAnnotation).toHaveBeenCalledWith(featureCollection([]));
		});

	});

});
