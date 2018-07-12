import { IAnnotationProperties, toolsInitialState, ToolsReducer, toolsFlags } from './tools.reducer';
import { AnnotationSetProperties, SetAnnotationMode, SetAnnotationsLayer } from '../actions/tools.actions';
import { cloneDeep } from 'lodash';
import {
	ILayerState, initialLayersState,
	LayersReducer
} from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';

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
		const payload: IAnnotationProperties = {
			fillColor: 'gray',
			strokeColor: 'blue',
			strokeWidth: 4
		};
		const action = new AnnotationSetProperties(payload);
		const result = ToolsReducer(cloneDeep(toolsInitialState), action);
		expect(result.annotationProperties).toEqual(payload);


		const secPayload: IAnnotationProperties = {
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

	it('SET_LAYER', () => {
		const action = new SetAnnotationsLayer(<any>'some geoJSON Object');
		const result = ToolsReducer(toolsInitialState, action);
		expect(result.annotationsLayer).toEqual(<any>'some geoJSON Object');
	});

});
