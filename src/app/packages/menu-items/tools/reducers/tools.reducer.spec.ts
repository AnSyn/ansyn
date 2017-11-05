import { toolsInitialState, ToolsReducer } from './tools.reducer';
import { AnnotationClose, AnnotationOpen, SetAnnotationMode } from '../actions/tools.actions';
import { cloneDeep } from 'lodash';

describe('ToolsReducer', () => {

	it('check initial state ', () => {
		expect(toolsInitialState.flags.get('annotations')).toBe(true);
		expect(toolsInitialState.flags.get('geoRegisteredOptionsEnabled')).toBe(true);
	});

	it('Check ANNOTATION_OPEN', () => {
		const action = new AnnotationOpen(true);
		const result = ToolsReducer(cloneDeep(toolsInitialState), action);
		expect(result.flags.get('annotations')).toBe(true);
	});

	it('Check ANNOTATION_OPEN', () => {
		const action = new AnnotationClose(false);
		const result = ToolsReducer(cloneDeep(toolsInitialState), action);
		expect(result.flags.get('annotations')).toBe(false);
	});

	it('Check SET_ANNOTATION_MODE', () => {
		const action = new SetAnnotationMode('Point');
		const result = ToolsReducer(cloneDeep(toolsInitialState), action);
		expect(result.annotationMode).toBe('Point');
	});
});
