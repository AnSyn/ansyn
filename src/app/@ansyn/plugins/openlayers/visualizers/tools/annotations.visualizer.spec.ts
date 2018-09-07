import { inject, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { of } from 'rxjs/index';
import { toolsConfig } from '@ansyn/menu-items/tools/models/tools-config';
import { featureCollection } from '@turf/turf';
import { AnnotationsVisualizer } from './annotations.visualizer';

describe('AnnotationsVisualizer', () => {
	let annotationsVisualizer: AnnotationsVisualizer;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [AnnotationsVisualizer, {
				provide: ProjectionService,
				useValue: { projectCollectionAccurately: of(true) }
			}, { provide: toolsConfig, useValue: { Annotations: { displayId: true } } }],
			imports: [StoreModule.forRoot({})]
		});
	});

	beforeEach(inject([AnnotationsVisualizer], (_annotationsVisualizer: AnnotationsVisualizer) => {
		annotationsVisualizer = _annotationsVisualizer;
	}));

	it('should be created', () => {
		expect(annotationsVisualizer).toBeTruthy();
	});

	it('onDipsose should call removeDrawInteraction', () => {
		spyOn(annotationsVisualizer, 'removeDrawInteraction');
		annotationsVisualizer.onDispose();
		expect(annotationsVisualizer.removeDrawInteraction).toHaveBeenCalled();
	});

	it('resetInteractions should call removeInteraction, addInteraction', () => {
		spyOn(annotationsVisualizer, 'addInteraction');
		spyOn(annotationsVisualizer, 'removeInteraction');
		annotationsVisualizer.resetInteractions();
		expect(annotationsVisualizer.addInteraction).toHaveBeenCalled();
		expect(annotationsVisualizer.removeInteraction).toHaveBeenCalled();
	});

	describe('onAnnotationsChange should call removeInteraction, addInteraction', () => {

		it('should call showAnnotation features collection', () => {
			spyOn(annotationsVisualizer, 'showAnnotation');
			annotationsVisualizer.onAnnotationsChange([{}, false, [], true, '']);
			expect(annotationsVisualizer.showAnnotation).toHaveBeenCalledWith(featureCollection([]));
		});

	});

});
