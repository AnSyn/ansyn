// import { AnnotationData } from '@ansyn/map-facade/actions/map.actions';
// import {
// 	AnnotationVisualizerAgentAction,
// 	SetAnnotationMode
// } from '@ansyn/menu-items/tools/actions/tools.actions';
// import { cold, hot } from 'jasmine-marbles';
// import { cloneDeep } from 'lodash';
// import { UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
//
// describe('@Effect annotationData$', () => {
// 	it('remove feature from the annotationLayer', () => {
// 		// const geoJsonData = Json.parse(geoJsonDataAsString);
// 		selectedCase.state.layers.annotationsLayer = geoJsonDataAsString;
// 		const featureId = 1509537616256;
//
// 		const newSelectCase = cloneDeep(selectedCase);
// 		const layer = JSON.parse(geoJsonDataAsString);
// 		const geoJsonFormat = new GeoJSON();
// 		const featureIndex = layer.features.findIndex(featureString => {
// 			const feature = geoJsonFormat.readFeature(featureString);
// 			return feature.values_.id === featureId;
// 		});
//
// 		layer.features.splice(featureIndex, 1);
// 		newSelectCase.state.layers.annotationsLayer = JSON.stringify(layer);
//
// 		const action = new AnnotationData({
// 			action: 'remove',
// 			featureId
// 		});
// 		actions = hot('--a--', { a: action });
//
// 		const expectedResult = cold('--(bc)--', {
// 			b: new UpdateCaseAction(newSelectCase),
// 			c: new AnnotationVisualizerAgentAction({
// 				maps: 'all',
// 				action: 'show'
// 			})
// 		});
//
// 		expect(visualizersAppEffects.annotationData$).toBeObservable(expectedResult);
//
// 	});
//
// });
//
// describe('@Effect annotationVisualizerAgent$ ', () => {
// 	let fakeVisualizer;
// 	let fakeCommunicator;
// 	const getGeoJsonValue = { 'test': 'works' };
//
// 	beforeEach(() => {
// 		fakeVisualizer = jasmine.createSpyObj([
// 			'removeLayer',
// 			'addLayer',
// 			'removeInteraction',
// 			'addSelectInteraction',
// 			'drawFeatures',
// 			'rectangleInteraction',
// 			'arrowInteraction',
// 			'createInteraction',
// 			'changeLine',
// 			'changeStroke',
// 			'changeFill',
// 			'drawFeatures',
// 			'getGeoJson'
//
//
// 		]);
//
// 		fakeCommunicator = {
// 			getVisualizer: (): any => fakeVisualizer
// 		};
//
// 		fakeVisualizer.getGeoJson.and.returnValue(getGeoJsonValue);
// 		spyOn(imageryCommunicatorService, 'provide').and.callFake((id) => fakeCommunicator);
// 		// spyOn(fakeVisualizer.prototype, 'getGeoJson').and.returnValue(getGeoJsonValue);
// 	});
//
// 	const testActionOnMaps = [
// 		{ maps: 'all', result: 3 },
// 		{ maps: 'others', result: 2 },
// 		{ maps: 'active', result: 1 }
// 	];
//
// 	testActionOnMaps.forEach(item => {
// 		it(`check ${item.maps} maps are called`, () => {
// 			const action = new AnnotationVisualizerAgentAction({
// 				maps: item.maps,
// 				action: 'changeLine',
// 				value: 'temp'
// 			});
// 			actions = hot('--a--', { a: action });
//
// 			expect(visualizersAppEffects.annotationVisualizerAgent$).toBeObservable(cold('-'));
// 			expect(fakeVisualizer.changeLine).toHaveBeenCalledTimes(item.result);
// 		});
// 	});
//
// 	it('check addLayer action', () => {
// 		const action = new AnnotationVisualizerAgentAction({
// 			maps: 'all',
// 			action: 'addLayer',
// 			value: 'temp'
// 		});
// 		actions = hot('--a--', { a: action });
// 		expect(visualizersAppEffects.annotationVisualizerAgent$).toBeObservable(cold('-'));
//
// 		expect(fakeVisualizer.removeLayer).toHaveBeenCalled();
// 		expect(fakeVisualizer.addLayer).toHaveBeenCalled();
// 	});
//
// 	it('check show action', () => {
// 		selectedCase.state.layers.annotationsLayer = geoJsonDataAsString;
// 		const action = new AnnotationVisualizerAgentAction({
// 			maps: 'all',
// 			action: 'show',
// 			value: 'temp'
// 		});
// 		actions = hot('--a--', { a: action });
// 		expect(visualizersAppEffects.annotationVisualizerAgent$).toBeObservable(cold('-'));
//
// 		expect(fakeVisualizer.removeLayer).toHaveBeenCalled();
// 		expect(fakeVisualizer.addLayer).toHaveBeenCalled();
// 		expect(fakeVisualizer.removeInteraction).toHaveBeenCalled();
// 		expect(fakeVisualizer.addSelectInteraction).toHaveBeenCalled();
// 		expect(fakeVisualizer.drawFeatures).toHaveBeenCalledWith(geoJsonDataAsString);
// 	});
//
// 	const testCreateInteraction = [
// 		{ type: 'Rectangle', func: 'rectangleInteraction', useValue: false },
// 		{ type: 'Arrow', func: 'arrowInteraction', useValue: false },
// 		{ type: 'Circle', func: 'createInteraction', useValue: true }];
//
// 	testCreateInteraction.forEach(item => {
// 		it(`check ${item.type} - create interaction`, () => {
// 			const action = new AnnotationVisualizerAgentAction({
// 				maps: 'all',
// 				action: 'createInteraction',
// 				type: item.type
// 			});
// 			actions = hot('--a--', { a: action });
// 			expect(visualizersAppEffects.annotationVisualizerAgent$).toBeObservable(cold('-'));
//
// 			if (item.useValue) {
// 				expect(fakeVisualizer[item.func]).toHaveBeenCalledWith(item.type);
// 			} else {
// 				expect(fakeVisualizer[item.func]).toHaveBeenCalled();
// 			}
// 		});
// 	});
//
// 	it('check remove interaction', () => {
// 		const action = new AnnotationVisualizerAgentAction({
// 			maps: 'all',
// 			action: 'removeInteraction'
//
// 		});
// 		actions = hot('--a--', { a: action });
// 		expect(visualizersAppEffects.annotationVisualizerAgent$).toBeObservable(cold('-'));
//
// 		expect(fakeVisualizer.removeInteraction).toHaveBeenCalled();
// 	});
//
// 	const testChangesActions = [
// 		{ type: 'changeLine', func: 'changeLine' },
// 		{ type: 'changeStrokeColor', func: 'changeStroke' },
// 		{ type: 'changeFillColor', func: 'changeFill' }
// 	];
//
// 	testChangesActions.forEach(item => {
// 		const value = 'temp';
// 		it(`check ${item.type} action`, () => {
// 			const action = new AnnotationVisualizerAgentAction({
// 				maps: 'all',
// 				action: item.type,
// 				value
// 			});
// 			actions = hot('--a--', { a: action });
// 			expect(visualizersAppEffects.annotationVisualizerAgent$).toBeObservable(cold('-'));
//
// 			expect(fakeVisualizer[item.func]).toHaveBeenCalledWith(value);
// 		});
// 	});
//
// 	it('check refreshDrawing layer', () => {
// 		selectedCase.state.layers.annotationsLayer = geoJsonDataAsString;
// 		const action = new AnnotationVisualizerAgentAction({
// 			maps: 'all',
// 			action: 'refreshDrawing'
// 		});
//
// 		actions = hot('--a--', { a: action });
// 		expect(visualizersAppEffects.annotationVisualizerAgent$).toBeObservable(cold('-'));
//
// 		// toHaveBeenCalledWith = selectedCase.state.layers.annotationsLayer
// 		expect(fakeVisualizer.drawFeatures).toHaveBeenCalledWith(geoJsonDataAsString);
//
// 	});
//
// 	it('check endDrawing action with annotation layer enabled', () => {
// 		layersState.displayAnnotationsLayer = true;
// 		const action = new AnnotationVisualizerAgentAction({
// 			maps: 'all',
// 			action: 'endDrawing'
// 		});
// 		actions = hot('--a--', { a: action });
// 		expect(visualizersAppEffects.annotationVisualizerAgent$).toBeObservable(cold('-'));
//
// 		expect(fakeVisualizer.addSelectInteraction).toHaveBeenCalled();
// 	});
//
// 	it('check endDrawing action with annotation layer disabled', () => {
// 		layersState.displayAnnotationsLayer = false;
// 		const action = new AnnotationVisualizerAgentAction({
// 			maps: 'all',
// 			action: 'endDrawing'
// 		});
// 		actions = hot('--a--', { a: action });
// 		expect(visualizersAppEffects.annotationVisualizerAgent$).toBeObservable(cold('-'));
//
// 		expect(fakeVisualizer.removeLayer).toHaveBeenCalled();
// 	});
//
// 	it('check saveDrawing action ', () => {
// 		const newCase = cloneDeep(selectedCase);
// 		newCase.state.layers.annotationsLayer = (<any>getGeoJsonValue);
// 		const action = new AnnotationVisualizerAgentAction({
// 			maps: 'active',
// 			action: 'saveDrawing'
// 		});
// 		actions = hot('--a--', { a: action });
//
// 		const expectedResult = cold('--(ab)--', {
// 			a: new UpdateCaseAction(newCase),
// 			b: new SetAnnotationMode()
// 		});
//
// 		expect(visualizersAppEffects.annotationVisualizerAgent$).toBeObservable(expectedResult);
//
// 	});
//
// 	it('check remove layer', () => {
// 		const action = new AnnotationVisualizerAgentAction({
// 			maps: 'all',
// 			action: 'removeLayer'
//
// 		});
//
// 		actions = hot('--a--', { a: action });
// 		expect(visualizersAppEffects.annotationVisualizerAgent$).toBeObservable(cold('-'));
//
// 		expect(fakeVisualizer.removeInteraction).toHaveBeenCalled();
// 		expect(fakeVisualizer.removeLayer).toHaveBeenCalled();
// 	});
//
//
// });








// it('updateAnnotationLayersFlags$ - call ShowAnnotationsLayerOnInit', () => {
// 	actions = hot('--a--', {
// 		a: new SelectCaseAction(<Case>{
// 			state: {
// 				layers: {
// 					displayAnnotationsLayer: true
// 				}
// 			}
// 		})
// 	});
//
// 	let expectedResult = cold('--b--', { b: new ShowAnnotationsLayerOnInit({ update: false }) });
// 	expect(casesAppEffects.updateAnnotationLayersFlags$).toBeObservable(expectedResult);
// });
//
// it('updateAnnotationLayersFlags$ - call ShowAnnotationsLayer', () => {
// 	imageryCommunicatorService.createCommunicator(new ImageryComponentManager(null, null, null, null, null, null, 'id'));
// 	actions = hot('--a--', {
// 		a: new SelectCaseAction(<Case>{
// 			state: {
// 				layers: {
// 					displayAnnotationsLayer: true
// 				}
// 			}
// 		})
// 	});
//
// 	let expectedResult = cold('--b--', { b: new ShowAnnotationsLayer({ update: false }) });
// 	expect(casesAppEffects.updateAnnotationLayersFlags$).toBeObservable(expectedResult);
// });
//
// it('updateAnnotationLayersFlags$ - call HideAnnotationsLayer', () => {
// 	actions = hot('--a--', {
// 		a: new SelectCaseAction(<Case>{
// 			state: {
// 				layers: {
// 					displayAnnotationsLayer: false
// 				}
// 			}
// 		})
// 	});
//
// 	let expectedResult = cold('--b--', { b: new HideAnnotationsLayer({ update: false }) });
// 	expect(casesAppEffects.updateAnnotationLayersFlags$).toBeObservable(expectedResult);
// });
//
