import { async, inject, TestBed } from '@angular/core/testing';

import { Store, StoreModule } from '@ngrx/store';
import {
	casesFeatureKey,
	CasesReducer,
	casesStateSelector,
	ICasesState,
	initialCasesState
} from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { VisualizersAppEffects } from './visualizers.app.effects';
import {
	AnnotationData,
	DbclickFeatureTriggerAction,
	DrawOverlaysOnMapTriggerAction,
	DrawPinPointAction,
	HoverFeatureTriggerAction,
	SetMapsDataActionStore
} from '@ansyn/map-facade/actions/map.actions';
import {
	DisplayOverlayFromStoreAction,
	MouseOutDropAction,
	MouseOverDropAction,
	OverlaysMarkupAction,
	SetFilteredOverlaysAction
} from '@ansyn/overlays/actions/overlays.actions';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import {
	AddCaseSuccessAction,
	SelectCaseAction,
	UpdateCaseAction
} from '@ansyn/menu-items/cases/actions/cases.actions';
import { Case } from '@ansyn/core/models/case.model';
import {
	AnnotationVisualizerAgentAction,
	SetAnnotationMode,
	ShowOverlaysFootprintAction
} from '@ansyn/menu-items/tools/actions/tools.actions';
import { FootprintPolylineVisualizerType } from '@ansyn/open-layer-visualizers/overlays/polyline-visualizer';
import {
	IMapState,
	initialMapState,
	mapFeatureKey,
	MapReducer,
	mapStateSelector
} from '@ansyn/map-facade/reducers/map.reducer';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { Observable } from 'rxjs/Observable';
import {
	ILayerState,
	initialLayersState,
	layersStateSelector
} from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { cloneDeep } from 'lodash';
import GeoJSON from 'ol/format/geojson';
import { CoreService } from '@ansyn/core/services/core.service';
import { coreInitialState, coreStateSelector } from '@ansyn/core/reducers/core.reducer';

describe('VisualizersAppEffects', () => {
	let visualizersAppEffects: VisualizersAppEffects;
	let store: Store<any>;
	let actions: Observable<any>;
	let imageryCommunicatorService: ImageryCommunicatorService = null;
	let coreState = coreInitialState;
	let caseState: ICasesState = cloneDeep(initialCasesState);
	let layersState: ILayerState = cloneDeep(initialLayersState);
	let mapState: IMapState = cloneDeep(initialMapState);

	const geoJsonDataAsString = '{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-8864905.04168913,4968343.241604401],[-7561221.649244596,4968343.241604401],[-7561221.649244596,5520348.311595516],[-8864905.04168913,5520348.311595516],[-8864905.04168913,4968343.241604401]]]},"properties":{"id":1509537610583,"style":{"stroke":{"color":"#3399CC","width":2},"fill":{"color":"rgba(255,255,255,0.4)"},"point":{"radius":4},"line":{"width":2}},"geometryName":"Annotate-Box","data":{}}},{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-10928571.403085884,4456440.158943544],[-10523551.35427145,4456440.158943544],[-10523551.35427145,5345021.014580127],[-10928571.403085884,5345021.014580127],[-10928571.403085884,4456440.158943544]]]},"properties":{"id":1509537616256,"style":{"stroke":{"color":"#3399CC","width":2},"fill":{"color":"rgba(255,255,255,0.4)"},"point":{"radius":4},"line":{"width":2}},"geometryName":"Annotate-Box","data":{}}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-11363070.980878033,6262825.420860147]},"properties":{"id":1509537618448,"style":{"stroke":{"color":"#3399CC","width":2},"fill":{"color":"rgba(255,255,255,0.4)"},"point":{"radius":4},"line":{"width":2}},"geometryName":"Annotate-Circle","data":{},"radius":940276.8116146456}},{"type":"Feature","geometry":{"type":"LineString","coordinates":[[-10040630.493284997,5896798.762447442],[-8994697.493933458,6116608.3346863]]},"properties":{"id":1509537621288,"style":{"stroke":{"color":"#3399CC","width":2},"fill":{"color":"rgba(255,255,255,0.4)"},"point":{"radius":4},"line":{"width":2}},"geometryName":"Annotate-LineString","data":{}}},{"type":"Feature","geometry":{"type":"LineString","coordinates":[[-7214037.4120918205,6124373.010826077],[-6661961.022834513,5167945.174800512]]},"properties":{"id":1509537624378,"style":{"stroke":{"color":"#3399CC","width":2},"fill":{"color":"rgba(255,255,255,0.4)"},"point":{"radius":4},"line":{"width":2}},"geometryName":"Annotate-Arrow","data":{}}}]}';


	const selectedCase: Case = {
		id: '1234-5678',
		state:
			{
				maps:
					{
						activeMapId: 'activeMapId',
						data: [
							{
								id: 'activeMapId',
								data: {
									overlayDisplayMode: 'Polygon'
								}
							},
							{
								id: 'notActiveMapId1',
								data: {}
							},
							{
								id: 'notActiveMapId2',
								data: {}
							}

						]
					},
				layers: {
					annotationsLayer: {}
				}
			}
	} as Case;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({ [casesFeatureKey]: CasesReducer, [mapFeatureKey]: MapReducer })
			],
			providers: [
				VisualizersAppEffects,
				provideMockActions(() => actions),
				ImageryCommunicatorService
			]

		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
		store.dispatch(new AddCaseSuccessAction(selectedCase));
		store.dispatch(new SelectCaseAction(selectedCase));
		store.dispatch(new SetMapsDataActionStore({
			mapsList: selectedCase.state.maps.data,
			activeMapId: selectedCase.state.maps.activeMapId
		}));

		caseState.selectedCase = selectedCase;
		const fakeStore = new Map<any, any>([
			[casesStateSelector, caseState],
			[layersStateSelector, layersState],
			[mapStateSelector, mapState],
			[coreStateSelector, coreState]
		]);

		spyOn(store, 'select').and.callFake(type => Observable.of(fakeStore.get(type)));
	}));

	beforeEach(inject([Store, VisualizersAppEffects, ImageryCommunicatorService], (_store: Store<any>, _visualizersAppEffects: VisualizersAppEffects, _imageryCommunicatorService: ImageryCommunicatorService) => {
		visualizersAppEffects = _visualizersAppEffects;
		imageryCommunicatorService = _imageryCommunicatorService;

	}));

	describe('@Effect annotationData$', () => {
		it('remove feature from the annotationLayer', () => {
			// const geoJsonData = Json.parse(geoJsonDataAsString);
			selectedCase.state.layers.annotationsLayer = geoJsonDataAsString;
			const featureId = 1509537616256;

			const newSelectCase = cloneDeep(selectedCase);
			const layer = JSON.parse(geoJsonDataAsString);
			const geoJsonFormat = new GeoJSON();
			const featureIndex = layer.features.findIndex(featureString => {
				const feature = geoJsonFormat.readFeature(featureString);
				return feature.values_.id === featureId;
			});

			layer.features.splice(featureIndex, 1);
			newSelectCase.state.layers.annotationsLayer = JSON.stringify(layer);

			const action = new AnnotationData({
				action: 'remove',
				featureId
			});
			actions = hot('--a--', { a: action });

			const expectedResult = cold('--(bc)--', {
				b: new UpdateCaseAction(newSelectCase),
				c: new AnnotationVisualizerAgentAction({
					maps: 'all',
					action: 'show'
				})
			});

			expect(visualizersAppEffects.annotationData$).toBeObservable(expectedResult);

		});

	});

	describe('@Effect annotationVisualizerAgent$ ', () => {
		let fakeVisualizer;
		let fakeCommunicator;
		const getGeoJsonValue = { 'test': 'works' };

		beforeEach(() => {
			fakeVisualizer = jasmine.createSpyObj([
				'removeLayer',
				'addLayer',
				'removeInteraction',
				'addSelectInteraction',
				'drawFeatures',
				'rectangleInteraction',
				'arrowInteraction',
				'createInteraction',
				'changeLine',
				'changeStroke',
				'changeFill',
				'drawFeatures',
				'getGeoJson'


			]);

			fakeCommunicator = {
				getVisualizer: (): any => fakeVisualizer
			};

			fakeVisualizer.getGeoJson.and.returnValue(getGeoJsonValue);
			spyOn(imageryCommunicatorService, 'provide').and.callFake((id) => fakeCommunicator);
			// spyOn(fakeVisualizer.prototype, 'getGeoJson').and.returnValue(getGeoJsonValue);
		});

		const testActionOnMaps = [
			{ maps: 'all', result: 3 },
			{ maps: 'others', result: 2 },
			{ maps: 'active', result: 1 }
		];

		testActionOnMaps.forEach(item => {
			it(`check ${item.maps} maps are called`, () => {
				const action = new AnnotationVisualizerAgentAction({
					maps: item.maps,
					action: 'changeLine',
					value: 'temp'
				});
				actions = hot('--a--', { a: action });

				expect(visualizersAppEffects.annotationVisualizerAgent$).toBeObservable(cold('-'));
				expect(fakeVisualizer.changeLine).toHaveBeenCalledTimes(item.result);
			});
		});

		it('check addLayer action', () => {
			const action = new AnnotationVisualizerAgentAction({
				maps: 'all',
				action: 'addLayer',
				value: 'temp'
			});
			actions = hot('--a--', { a: action });
			expect(visualizersAppEffects.annotationVisualizerAgent$).toBeObservable(cold('-'));

			expect(fakeVisualizer.removeLayer).toHaveBeenCalled();
			expect(fakeVisualizer.addLayer).toHaveBeenCalled();
		});

		it('check show action', () => {
			selectedCase.state.layers.annotationsLayer = geoJsonDataAsString;
			const action = new AnnotationVisualizerAgentAction({
				maps: 'all',
				action: 'show',
				value: 'temp'
			});
			actions = hot('--a--', { a: action });
			expect(visualizersAppEffects.annotationVisualizerAgent$).toBeObservable(cold('-'));

			expect(fakeVisualizer.removeLayer).toHaveBeenCalled();
			expect(fakeVisualizer.addLayer).toHaveBeenCalled();
			expect(fakeVisualizer.removeInteraction).toHaveBeenCalled();
			expect(fakeVisualizer.addSelectInteraction).toHaveBeenCalled();
			expect(fakeVisualizer.drawFeatures).toHaveBeenCalledWith(geoJsonDataAsString);
		});

		const testCreateInteraction = [
			{ type: 'Rectangle', func: 'rectangleInteraction', useValue: false },
			{ type: 'Arrow', func: 'arrowInteraction', useValue: false },
			{ type: 'Circle', func: 'createInteraction', useValue: true }];

		testCreateInteraction.forEach(item => {
			it(`check ${item.type} - create interaction`, () => {
				const action = new AnnotationVisualizerAgentAction({
					maps: 'all',
					action: 'createInteraction',
					type: item.type
				});
				actions = hot('--a--', { a: action });
				expect(visualizersAppEffects.annotationVisualizerAgent$).toBeObservable(cold('-'));

				if (item.useValue) {
					expect(fakeVisualizer[item.func]).toHaveBeenCalledWith(item.type);
				} else {
					expect(fakeVisualizer[item.func]).toHaveBeenCalled();
				}
			});
		});

		it('check remove interaction', () => {
			const action = new AnnotationVisualizerAgentAction({
				maps: 'all',
				action: 'removeInteraction'

			});
			actions = hot('--a--', { a: action });
			expect(visualizersAppEffects.annotationVisualizerAgent$).toBeObservable(cold('-'));

			expect(fakeVisualizer.removeInteraction).toHaveBeenCalled();
		});

		const testChangesActions = [
			{ type: 'changeLine', func: 'changeLine' },
			{ type: 'changeStrokeColor', func: 'changeStroke' },
			{ type: 'changeFillColor', func: 'changeFill' }
		];

		testChangesActions.forEach(item => {
			const value = 'temp';
			it(`check ${item.type} action`, () => {
				const action = new AnnotationVisualizerAgentAction({
					maps: 'all',
					action: item.type,
					value
				});
				actions = hot('--a--', { a: action });
				expect(visualizersAppEffects.annotationVisualizerAgent$).toBeObservable(cold('-'));

				expect(fakeVisualizer[item.func]).toHaveBeenCalledWith(value);
			});
		});

		it('check refreshDrawing layer', () => {
			selectedCase.state.layers.annotationsLayer = geoJsonDataAsString;
			const action = new AnnotationVisualizerAgentAction({
				maps: 'all',
				action: 'refreshDrawing'
			});

			actions = hot('--a--', { a: action });
			expect(visualizersAppEffects.annotationVisualizerAgent$).toBeObservable(cold('-'));

			// toHaveBeenCalledWith = selectedCase.state.layers.annotationsLayer
			expect(fakeVisualizer.drawFeatures).toHaveBeenCalledWith(geoJsonDataAsString);

		});

		it('check endDrawing action with annotation layer enabled', () => {
			layersState.displayAnnotationsLayer = true;
			const action = new AnnotationVisualizerAgentAction({
				maps: 'all',
				action: 'endDrawing'
			});
			actions = hot('--a--', { a: action });
			expect(visualizersAppEffects.annotationVisualizerAgent$).toBeObservable(cold('-'));

			expect(fakeVisualizer.addSelectInteraction).toHaveBeenCalled();
		});

		it('check endDrawing action with annotation layer disabled', () => {
			layersState.displayAnnotationsLayer = false;
			const action = new AnnotationVisualizerAgentAction({
				maps: 'all',
				action: 'endDrawing'
			});
			actions = hot('--a--', { a: action });
			expect(visualizersAppEffects.annotationVisualizerAgent$).toBeObservable(cold('-'));

			expect(fakeVisualizer.removeLayer).toHaveBeenCalled();
		});

		it('check saveDrawing action ', () => {
			const newCase = cloneDeep(selectedCase);
			newCase.state.layers.annotationsLayer = (<any>getGeoJsonValue);
			const action = new AnnotationVisualizerAgentAction({
				maps: 'active',
				action: 'saveDrawing'
			});
			actions = hot('--a--', { a: action });

			const expectedResult = cold('--(ab)--', {
				a: new UpdateCaseAction(newCase),
				b: new SetAnnotationMode()
			});

			expect(visualizersAppEffects.annotationVisualizerAgent$).toBeObservable(expectedResult);

		});

		it('check remove layer', () => {
			const action = new AnnotationVisualizerAgentAction({
				maps: 'all',
				action: 'removeLayer'

			});

			actions = hot('--a--', { a: action });
			expect(visualizersAppEffects.annotationVisualizerAgent$).toBeObservable(cold('-'));

			expect(fakeVisualizer.removeInteraction).toHaveBeenCalled();
			expect(fakeVisualizer.removeLayer).toHaveBeenCalled();
		});


	});

	it('onHoverFeatureSetMarkup$ should call getOverlaysMarkup with overlay hoverId, result should be send as payload of OverlaysMarkupAction', () => {
		const markup = [{ id: '1234', class: 'active' }];
		spyOn(CoreService, 'getOverlaysMarkup').and.callFake(() => markup);
		actions = hot('--a--', {
			a: new HoverFeatureTriggerAction({
				id: 'fakeId',
				visualizerType: FootprintPolylineVisualizerType
			})
		});
		const expectedResults = cold('--b--', { b: new OverlaysMarkupAction(markup) });
		expect(visualizersAppEffects.onHoverFeatureSetMarkup$).toBeObservable(expectedResults);

	});

	it('onHoverFeatureEmitSyncHoverFeature$ should call setHoverFeature per communicator FootprintPolylineVisualizerType', () => {
		const fakeVisualizer = {
			setHoverFeature: () => {
			}
		};
		const fakeCommunicator = {
			getVisualizer: (): any => fakeVisualizer
		};
		spyOn(fakeVisualizer, 'setHoverFeature');
		spyOn(imageryCommunicatorService, 'communicatorsAsArray').and.callFake(() => [fakeCommunicator, fakeCommunicator]);
		const action = new HoverFeatureTriggerAction({
			id: 'fakeId',
			visualizerType: FootprintPolylineVisualizerType
		});
		actions = hot('--a--', { a: action });
		const expectedResults = cold('--b--', { b: action });
		expect(visualizersAppEffects.onHoverFeatureEmitSyncHoverFeature$).toBeObservable(expectedResults);
		expect(fakeCommunicator.getVisualizer().setHoverFeature).toHaveBeenCalledTimes(2);
	});

	describe('onMouseOverDropAction$ should return HoverFeatureTriggerAction (with "id" if MouseOverDropAction else "undefined")', () => {

		it('with "id" if MouseOverDropAction', () => {
			actions = hot('--a--', { a: new MouseOverDropAction('fakeId') });
			const expectedResults = cold('--b--', {
				b: new HoverFeatureTriggerAction({
					id: 'fakeId',
					visualizerType: FootprintPolylineVisualizerType
				})
			});
			expect(visualizersAppEffects.onMouseOverDropAction$).toBeObservable(expectedResults);
		});

		it('with "undefined" if not MouseOverDropAction', () => {
			actions = hot('--a--', { a: new MouseOutDropAction('fakeId') });
			const expectedResults = cold('--b--', {
				b: new HoverFeatureTriggerAction({
					id: undefined,
					visualizerType: FootprintPolylineVisualizerType
				})
			});
			expect(visualizersAppEffects.onMouseOverDropAction$).toBeObservable(expectedResults);
		});

	});

	it('onDbclickFeaturePolylineDisplayAction$ should call displayOverlayFromStoreAction with id from payload', () => {
		actions = hot('--a--', {
			a: new DbclickFeatureTriggerAction({
				id: 'fakeId',
				visualizerType: FootprintPolylineVisualizerType
			})
		});
		const expectedResults = cold('--b--', { b: new DisplayOverlayFromStoreAction({ id: 'fakeId' }) });
		expect(visualizersAppEffects.onDbclickFeaturePolylineDisplayAction$).toBeObservable(expectedResults);
	});

	it('markupVisualizer$ should call setMarkupFeatures per communicator', () => {
		const fakeVisualizer = {
			setMarkupFeatures: () => {
			}
		};
		const fakeCommunicator = {
			getVisualizer: (): any => fakeVisualizer
		};
		spyOn(fakeVisualizer, 'setMarkupFeatures');
		spyOn(imageryCommunicatorService, 'communicatorsAsArray').and.callFake(() => [fakeCommunicator, fakeCommunicator, fakeCommunicator]);
		const action = new OverlaysMarkupAction([1, 2, 3, 4]);
		actions = hot('--a--', { a: action });
		const expectedResults = cold('--b--', { b: action });
		expect(visualizersAppEffects.markupVisualizer$).toBeObservable(expectedResults);
		expect(fakeCommunicator.getVisualizer().setMarkupFeatures).toHaveBeenCalledWith([1, 2, 3, 4]);
		expect(fakeCommunicator.getVisualizer().setMarkupFeatures).toHaveBeenCalledTimes(3);
	});

	it('Effect : updateCaseFromTools$ - with OverlayVisualizerMode === "Hitmap"', () => {
		mapState.mapsList = [...selectedCase.state.maps.data];
		mapState.activeMapId = selectedCase.state.maps.activeMapId;
		const updatedMapsList = cloneDeep(mapState.mapsList);
		updatedMapsList[0].data.overlayDisplayMode = 'Hitmap';

		actions = hot('--a--', {
			a: new ShowOverlaysFootprintAction('Hitmap')
		});

		const expectedResults = cold('--(ab)--', {
			a: new SetMapsDataActionStore({ mapsList: updatedMapsList }),
			b: new DrawOverlaysOnMapTriggerAction()
		});

		expect(visualizersAppEffects.updateCaseFromTools$).toBeObservable(expectedResults);
	});

	it('shouldDrawOverlaysOnMap$ should return DrawOverlaysOnMapTriggerAction ( SET_FILTERS action) ', () => {
		actions = hot('--a--', { a: new SetFilteredOverlaysAction([]) });
		const expectedResults = cold('--b--', { b: new DrawOverlaysOnMapTriggerAction() });
		expect(visualizersAppEffects.shouldDrawOverlaysOnMap$).toBeObservable(expectedResults);
	});

	it('drawOverlaysOnMap$ should call drawOverlayOnMap() for each map(from selected case)', () => {
		spyOn(visualizersAppEffects, 'drawOverlaysOnMap');
		const action = new DrawOverlaysOnMapTriggerAction();
		actions = hot('--a--', { a: action });
		// undefined because: drawOverlaysOnMap$ map don't have a return
		const expectedResults = cold('--b--', { b: undefined });

		expect(visualizersAppEffects.drawOverlaysOnMap$).toBeObservable(expectedResults);
		expect(visualizersAppEffects.drawOverlaysOnMap).toHaveBeenCalledTimes(3);
	});

	it('drawPinPoint$ should call drawPinPointIconOnMap() for each map(from selected case)', () => {
		spyOn(visualizersAppEffects, 'drawPinPointIconOnMap');
		const action = new DrawPinPointAction([-70.33666666666667, 25.5]);
		actions = hot('--a--', { a: action });
		// undefined because: drawPinPoint$ map don't have a return
		const expectedResults = cold('--b--', { b: undefined });

		expect(visualizersAppEffects.drawPinPoint$).toBeObservable(expectedResults);
		expect(visualizersAppEffects.drawPinPointIconOnMap).toHaveBeenCalledTimes(3);
	});
});
