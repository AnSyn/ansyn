import { AnnotationsVisualizer } from '@ansyn/plugins/openlayers/visualizers/tools/annotations.visualizer';
import { inject, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import olColor from 'ol/color';
import { Observable } from 'rxjs/Observable';

describe('AnnotationsVisualizer', () => {
	let annotationsVisualizer: AnnotationsVisualizer;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [AnnotationsVisualizer],
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

	it('changeStrokeWidth should call updateStyle with new stroke "width" value', () => {
		const width = 10;
		const expectedResult = { initial: { stroke: { width } } };
		spyOn(annotationsVisualizer, 'updateStyle');
		annotationsVisualizer.changeStrokeWidth(10);
		expect(annotationsVisualizer.updateStyle).toHaveBeenCalledWith(expectedResult);
	});

	it('changeStrokeColor should call updateStyle with new stroke "color" value', () => {
		const color = 'green';
		const expectedResult = { initial: { stroke: { color } } };
		spyOn(annotationsVisualizer, 'updateStyle');
		annotationsVisualizer.changeStrokeColor(color);
		expect(annotationsVisualizer.updateStyle).toHaveBeenCalledWith(expectedResult);
	});


	it('changeFillColor should call updateStyle with new fill "color" value', () => {
		const color = 'red';
		const [r, g, b] = Array.from(olColor.asArray(color));
		const rgbaColor = olColor.asString([r, g, b, AnnotationsVisualizer.fillAlpha]);
		const expectedResult = { initial: { fill: { color: rgbaColor } } };
		spyOn(annotationsVisualizer, 'updateStyle');
		annotationsVisualizer.changeFillColor(color);
		expect(annotationsVisualizer.updateStyle).toHaveBeenCalledWith(expectedResult);
	});

	it('resetInteractions should call removeInteraction, addInteraction', () => {
		spyOn(annotationsVisualizer, 'addInteraction');
		spyOn(annotationsVisualizer, 'removeInteraction');
		annotationsVisualizer.resetInteractions();
		expect(annotationsVisualizer.addInteraction).toHaveBeenCalled();
		expect(annotationsVisualizer.removeInteraction).toHaveBeenCalled();
	});

	describe('onAnnotationsChange should call removeInteraction, addInteraction', () => {

		it('should clearEntities if displayAnnotationsLayer = false', () => {
			spyOn(annotationsVisualizer, 'clearEntities');
			annotationsVisualizer.onAnnotationsChange([{}, false, false, true]);
			expect(annotationsVisualizer.clearEntities).toHaveBeenCalled();
		});

	});

});
