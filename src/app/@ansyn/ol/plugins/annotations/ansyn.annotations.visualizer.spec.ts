import { inject, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { of } from 'rxjs';
import { featureCollection } from '@turf/turf';
import { toolsConfig } from '../../../ansyn/modules/menu-items/tools/models/tools-config';
import { AnnotationsVisualizer } from './annotations.visualizer';
import { OpenLayersProjectionService } from '../../projection/open-layers-projection.service';

describe('AnnotationsVisualizer', () => {
	let AnnotationsVisualizer: AnnotationsVisualizer;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [AnnotationsVisualizer, {
				provide: OpenLayersProjectionService,
				useValue: { projectCollectionAccurately: of(true) }
			}, { provide: toolsConfig, useValue: { Annotations: { displayId: true } } }],
			imports: [StoreModule.forRoot({})]
		});
	});

	beforeEach(inject([AnnotationsVisualizer], (_AnnotationsVisualizer: AnnotationsVisualizer) => {
		AnnotationsVisualizer = _AnnotationsVisualizer;
	}));

	it('should be created', () => {
		expect(AnnotationsVisualizer).toBeTruthy();
	});

	it('onDipsose should call removeDrawInteraction', () => {
		spyOn(AnnotationsVisualizer, 'removeDrawInteraction');
		AnnotationsVisualizer.onDispose();
		expect(AnnotationsVisualizer.removeDrawInteraction).toHaveBeenCalled();
	});

	it('resetInteractions should call removeInteraction, addInteraction', () => {
		spyOn(AnnotationsVisualizer, 'addInteraction');
		spyOn(AnnotationsVisualizer, 'removeInteraction');
		AnnotationsVisualizer.resetInteractions();
		expect(AnnotationsVisualizer.addInteraction).toHaveBeenCalled();
		expect(AnnotationsVisualizer.removeInteraction).toHaveBeenCalled();
	});

	describe('onAnnotationsChange should call removeInteraction, addInteraction', () => {

		it('should call showAnnotation features collection', () => {
			spyOn(AnnotationsVisualizer, 'showAnnotation');
			AnnotationsVisualizer.onAnnotationsChange([{}, false, [], true, '']);
			expect(AnnotationsVisualizer.showAnnotation).toHaveBeenCalledWith(featureCollection([]));
		});

	});

});
