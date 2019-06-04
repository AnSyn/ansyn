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
		const map = jasmine.createSpyObj({ un: () => {}, removeInteraction: () => {} });
		spyOnProperty(annotationsVisualizer, 'iMap', 'get').and.callFake(() => ({ mapObject: map }));
		spyOn(annotationsVisualizer, 'removeDrawInteraction');
		annotationsVisualizer.onDispose();
		expect(annotationsVisualizer.removeDrawInteraction).toHaveBeenCalled();
		expect(map.un).toHaveBeenCalledTimes(2);
		expect(map.removeInteraction).toHaveBeenCalledWith(annotationsVisualizer.dragBox);
	});

	fit('on toggleVisable selected should be empty', () => {
		spyOnProperty(annotationsVisualizer, 'iMap', 'get').and.callFake(() => ({ removeLayer: () => {}, addLayer: () => {} }));
		annotationsVisualizer.toggleVisibility();
		expect(annotationsVisualizer.selected.length).toBe(0);
	})

});
