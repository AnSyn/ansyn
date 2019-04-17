import { inject, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { of } from 'rxjs/index';
import { featureCollection } from '@turf/turf';
import { AnnotationsVisualizer } from './annotations.visualizer';
import { OpenLayersProjectionService } from '../../../../../../../ol/projection/open-layers-projection.service';
import { toolsConfig } from '../../../../../menu-items/tools/models/tools-config';

describe('AnnotationsVisualizer', () => {
	let annotationsVisualizer: AnnotationsVisualizer;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [AnnotationsVisualizer, {
				provide: OpenLayersProjectionService,
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
