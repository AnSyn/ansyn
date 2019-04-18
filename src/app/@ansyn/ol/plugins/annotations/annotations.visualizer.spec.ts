import { inject, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AnnotationsVisualizer } from './annotations.visualizer';
import { OL_PLUGINS_CONFIG } from '../plugins.config';
import { OpenLayersProjectionService } from '../../projection/open-layers-projection.service';

describe('AnnotationsVisualizer', () => {
	let annotationsVisualizer: AnnotationsVisualizer;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				AnnotationsVisualizer,
				{
					provide: OpenLayersProjectionService,
					useValue: { projectCollectionAccurately: of(true) }
				},
				{
					provide: OL_PLUGINS_CONFIG,
					useValue: { Annotations: { displayId: true } }
				}
			],
			imports: []
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

});
