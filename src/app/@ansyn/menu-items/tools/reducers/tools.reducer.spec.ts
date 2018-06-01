import { AnnotationProperties, toolsInitialState, ToolsReducer, toolsFlags } from './tools.reducer';
import { AnnotationSetProperties, SetAnnotationMode } from '../actions/tools.actions';
import { cloneDeep } from 'lodash';

describe('ToolsReducer', () => {

	it('check initial state ', () => {
		expect(toolsInitialState.flags.get(toolsFlags.geoRegisteredOptionsEnabled)).toBe(true);
	});

	it('Check SET_ANNOTATION_MODE', () => {
		const action = new SetAnnotationMode('Point');
		const result = ToolsReducer(cloneDeep(toolsInitialState), action);
		expect(result.annotationMode).toBe('Point');
	});

	it('Check SET_ANNOTATION_PROPERTIES', () => {
		const payload: AnnotationProperties = {
			fillColor: 'gray',
			strokeColor: 'blue',
			strokeWidth: 4
		};
		const action = new AnnotationSetProperties(payload);
		const result = ToolsReducer(cloneDeep(toolsInitialState), action);
		expect(result.annotationProperties).toEqual(payload);


		const secPayload: AnnotationProperties = {
			fillColor: 'green',
		};

		const secAction = new AnnotationSetProperties(secPayload);
		const secResult = ToolsReducer(cloneDeep(result), secAction);

		expect(secResult.annotationProperties).toEqual({
			strokeColor: 'blue',
			strokeWidth: 4,
			fillColor: 'green'
		});
	});


});
