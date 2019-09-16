import { toolsFlags, toolsInitialState, ToolsReducer } from './tools.reducer';
import { AnnotationSetProperties, SetAnnotationMode } from '../actions/tools.actions';
import { cloneDeep } from 'lodash';
import { AnnotationMode } from '@ansyn/ol';

describe('ToolsReducer', () => {

	it('check initial state ', () => {
		expect(toolsInitialState.flags.get(toolsFlags.geoRegisteredOptionsEnabled)).toBe(true);
	});

	it('Check SET_ANNOTATION_MODE', () => {
		const action = new SetAnnotationMode({ annotationMode: AnnotationMode.Point });
		const result = ToolsReducer(cloneDeep(toolsInitialState), action);
		expect(result.annotationMode).toBe('Point');
	});

	it('Check SET_ANNOTATION_PROPERTIES', () => {
		const payload = {
			fill: 'gray',
			stroke: 'blue',
			'stroke-width': 4
		};
		const action = new AnnotationSetProperties(payload);
		const result = ToolsReducer(cloneDeep(toolsInitialState), action);
		expect(result.annotationProperties).toEqual({ ...toolsInitialState.annotationProperties, ...payload });


		const secPayload = {
			fill: 'green'
		};

		const secAction = new AnnotationSetProperties(secPayload);
		const secResult = ToolsReducer(cloneDeep(result), secAction);

		expect(secResult.annotationProperties).toEqual({
			...toolsInitialState.annotationProperties,
			stroke: 'blue',
			'stroke-width': 4,
			fill: 'green'
		});
	});

});
