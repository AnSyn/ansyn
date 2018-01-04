import { async, inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import {
	casesFeatureKey, CasesReducer, casesStateSelector, ICasesState,
	initialCasesState
} from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import {
	IMapState, initialMapState, mapFeatureKey, MapReducer,
	mapStateSelector
} from '@ansyn/map-facade/reducers/map.reducer';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs/Observable';
import {
	ILayerState, initialLayersState,
	layersStateSelector
} from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { cloneDeep } from 'lodash';
import { coreInitialState, coreStateSelector } from '@ansyn/core/reducers/core.reducer';
import { VisualizersAnnotationsAppEffects } from './visualizers.annotations.app.effects';
import {
	AnnotationVisualizerAgentAction,
	SetAnnotationMode
} from '@ansyn/menu-items/tools/actions/tools.actions';
import { cold, hot } from 'jasmine-marbles';
import { SetAnnotationsLayer } from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { ActiveMapChangedAction, AnnotationDrawEndAction } from '@ansyn/map-facade/actions/map.actions';

fdescribe('VisualizersAnnotationsAppEffects', () => {
	let visualizersAnnotationsAppEffects: VisualizersAnnotationsAppEffects;
	let store: Store<any>;
	let actions: Observable<any>;
	let imageryCommunicatorService: ImageryCommunicatorService = null;
	let coreState = coreInitialState;
	let caseState: ICasesState = cloneDeep(initialCasesState);
	let layersState: ILayerState = cloneDeep(initialLayersState);
	let mapState: IMapState = cloneDeep(initialMapState);
	const geoJsonDataAsString = '{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-8864905.04168913,4968343.241604401],[-7561221.649244596,4968343.241604401],[-7561221.649244596,5520348.311595516],[-8864905.04168913,5520348.311595516],[-8864905.04168913,4968343.241604401]]]},"properties":{"id":1509537610583,"style":{"stroke":{"color":"#3399CC","width":2},"fill":{"color":"rgba(255,255,255,0.4)"},"point":{"radius":4},"line":{"width":2}},"geometryName":"Annotate-Box","data":{}}},{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-10928571.403085884,4456440.158943544],[-10523551.35427145,4456440.158943544],[-10523551.35427145,5345021.014580127],[-10928571.403085884,5345021.014580127],[-10928571.403085884,4456440.158943544]]]},"properties":{"id":1509537616256,"style":{"stroke":{"color":"#3399CC","width":2},"fill":{"color":"rgba(255,255,255,0.4)"},"point":{"radius":4},"line":{"width":2}},"geometryName":"Annotate-Box","data":{}}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-11363070.980878033,6262825.420860147]},"properties":{"id":1509537618448,"style":{"stroke":{"color":"#3399CC","width":2},"fill":{"color":"rgba(255,255,255,0.4)"},"point":{"radius":4},"line":{"width":2}},"geometryName":"Annotate-Circle","data":{},"radius":940276.8116146456}},{"type":"Feature","geometry":{"type":"LineString","coordinates":[[-10040630.493284997,5896798.762447442],[-8994697.493933458,6116608.3346863]]},"properties":{"id":1509537621288,"style":{"stroke":{"color":"#3399CC","width":2},"fill":{"color":"rgba(255,255,255,0.4)"},"point":{"radius":4},"line":{"width":2}},"geometryName":"Annotate-LineString","data":{}}},{"type":"Feature","geometry":{"type":"LineString","coordinates":[[-7214037.4120918205,6124373.010826077],[-6661961.022834513,5167945.174800512]]},"properties":{"id":1509537624378,"style":{"stroke":{"color":"#3399CC","width":2},"fill":{"color":"rgba(255,255,255,0.4)"},"point":{"radius":4},"line":{"width":2}},"geometryName":"Annotate-Arrow","data":{}}}]}';

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({
					[casesFeatureKey]: CasesReducer,
					[mapFeatureKey]: MapReducer
				})
			],
			providers: [
				VisualizersAnnotationsAppEffects,
				provideMockActions(() => actions),
				ImageryCommunicatorService
			]

		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
		const fakeStore = new Map<any, any>([
			[casesStateSelector, caseState],
			[layersStateSelector, layersState],
			[mapStateSelector, mapState],
			[coreStateSelector, coreState]
		]);

		spyOn(store, 'select').and.callFake(type => Observable.of(fakeStore.get(type)));
	}));

	beforeEach(inject([VisualizersAnnotationsAppEffects, ImageryCommunicatorService], (_visualizersAnnotationsAppEffects: VisualizersAnnotationsAppEffects, _imageryCommunicatorService: ImageryCommunicatorService) => {
		visualizersAnnotationsAppEffects = _visualizersAnnotationsAppEffects;
		imageryCommunicatorService = _imageryCommunicatorService;
	}));

	describe('@Effect annotationVisualizerAgent$ ', () => {
		let fakeVisualizer;
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

			fakeVisualizer.getGeoJson.and.returnValue(getGeoJsonValue);
			spyOn(visualizersAnnotationsAppEffects, 'annotationVisualizers').and.callFake(() => [fakeVisualizer]);
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
				const expectedResult = cold('--b--', { b: [action, layersState, mapState] });
				expect(visualizersAnnotationsAppEffects.annotationVisualizerAgent$).toBeObservable(expectedResult);
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
			const expectedResult = cold('--b--', { b: [action, layersState, mapState] });
			expect(visualizersAnnotationsAppEffects.annotationVisualizerAgent$).toBeObservable(expectedResult);
			expect(fakeVisualizer.removeLayer).toHaveBeenCalled();
			expect(fakeVisualizer.addLayer).toHaveBeenCalled();
		});

		it('check show action', () => {
			layersState.annotationsLayer = geoJsonDataAsString;
			const action = new AnnotationVisualizerAgentAction({
				maps: 'all',
				action: 'show',
				value: 'temp'
			});
			actions = hot('--a--', { a: action });
			const expectedResult = cold('--b--', { b: [action, layersState, mapState] });
			expect(visualizersAnnotationsAppEffects.annotationVisualizerAgent$).toBeObservable(expectedResult);
			expect(fakeVisualizer.removeLayer).toHaveBeenCalled();
			expect(fakeVisualizer.addLayer).toHaveBeenCalled();
			expect(fakeVisualizer.removeInteraction).toHaveBeenCalled();
			expect(fakeVisualizer.addSelectInteraction).toHaveBeenCalled();
			expect(fakeVisualizer.drawFeatures).toHaveBeenCalledWith(geoJsonDataAsString);
		});

		const testCreateInteraction = [
			{
				type: 'Rectangle',
				func: 'rectangleInteraction',
				useValue: false
			},
			{
				type: 'Arrow',
				func: 'arrowInteraction',
				useValue: false
			},
			{
				type: 'Circle',
				func: 'createInteraction',
				useValue: true
			}
		];

		testCreateInteraction.forEach(item => {
			it(`check ${item.type} - create interaction`, () => {
				const action = new AnnotationVisualizerAgentAction({
					maps: 'all',
					action: 'createInteraction',
					type: item.type
				});
				actions = hot('--a--', { a: action });
				const expectedResult = cold('--b--', { b: [action, layersState, mapState] });
				expect(visualizersAnnotationsAppEffects.annotationVisualizerAgent$).toBeObservable(expectedResult);

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
			const expectedResult = cold('--b--', { b: [action, layersState, mapState] });
			expect(visualizersAnnotationsAppEffects.annotationVisualizerAgent$).toBeObservable(expectedResult);
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
				const expectedResult = cold('--b--', { b: [action, layersState, mapState] });
				expect(visualizersAnnotationsAppEffects.annotationVisualizerAgent$).toBeObservable(expectedResult);
				expect(fakeVisualizer[item.func]).toHaveBeenCalledWith(value);
			});
		});

		it('check refreshDrawing layer', () => {
			layersState.annotationsLayer = geoJsonDataAsString;
			const action = new AnnotationVisualizerAgentAction({
				maps: 'all',
				action: 'refreshDrawing'
			});
			actions = hot('--a--', { a: action });
			const expectedResult = cold('--b--', { b: [action, layersState, mapState] });
			expect(visualizersAnnotationsAppEffects.annotationVisualizerAgent$).toBeObservable(expectedResult);
			expect(fakeVisualizer.drawFeatures).toHaveBeenCalledWith(geoJsonDataAsString);
		});

		it('check endDrawing action with annotation layer enabled', () => {
			layersState.displayAnnotationsLayer = true;
			const action = new AnnotationVisualizerAgentAction({
				maps: 'all',
				action: 'endDrawing'
			});
			actions = hot('--a--', { a: action });
			const expectedResult = cold('--b--', { b: [action, layersState, mapState] });
			expect(visualizersAnnotationsAppEffects.annotationVisualizerAgent$).toBeObservable(expectedResult);
			expect(fakeVisualizer.addSelectInteraction).toHaveBeenCalled();
		});

		it('check endDrawing action with annotation layer disabled', () => {
			layersState.displayAnnotationsLayer = false;
			const action = new AnnotationVisualizerAgentAction({
				maps: 'all',
				action: 'endDrawing'
			});
			actions = hot('--a--', { a: action });
			const expectedResult = cold('--b--', { b: [action, layersState, mapState] });
			expect(visualizersAnnotationsAppEffects.annotationVisualizerAgent$).toBeObservable(expectedResult);
			expect(fakeVisualizer.removeLayer).toHaveBeenCalled();
		});

		it('check remove layer', () => {
			const action = new AnnotationVisualizerAgentAction({
				maps: 'all',
				action: 'removeLayer'
			});
			actions = hot('--a--', { a: action });
			const expectedResult = cold('--b--', { b: [action, layersState, mapState] });
			expect(visualizersAnnotationsAppEffects.annotationVisualizerAgent$).toBeObservable(expectedResult);
			expect(fakeVisualizer.removeInteraction).toHaveBeenCalled();
			expect(fakeVisualizer.removeLayer).toHaveBeenCalled();
		});
	});

	it('drawAnnotationEnd$ should stringify the GeoJSON object and dispatch SetAnnotationsLayer', () => {
		spyOn(JSON, 'stringify').and.callFake(() => 'geojson string');
		const geoJson = <GeoJSON.GeoJsonObject> { 'geo': 'json' };
		actions = hot('--a--', { a: new AnnotationDrawEndAction(geoJson) });
		const expectedResult = cold('--b--', { b: new SetAnnotationsLayer('geojson string') });
		expect(visualizersAnnotationsAppEffects.drawAnnotationEnd$).toBeObservable(expectedResult);
	});

	it('cancelAnnotationEditMode$ should cancel annotation edit mode ', () => {
		actions = hot('--a--', { a: new ActiveMapChangedAction('mapId') });
		const expectedResult = cold('--b--', { b: new SetAnnotationMode() });
		expect(visualizersAnnotationsAppEffects.cancelAnnotationEditMode$).toBeObservable(expectedResult);
	});

	describe('annotationData$ should get data from layers store and dispatch AnnotationVisualizerAgentAction with relevant maps', () => {

		it('true displayAnnotationsLayer should dispatch with "all"', () => {
			layersState.displayAnnotationsLayer = true;
			actions = hot('--a--', { a: new SetAnnotationsLayer('annotationLayer') });
			const expectedResult = cold('--b--', {
				b: new AnnotationVisualizerAgentAction({
					action: 'show',
					maps: 'all'
				})
			});
			expect(visualizersAnnotationsAppEffects.annotationData$).toBeObservable(expectedResult);
		});

		it('false displayAnnotationsLayer should dispatch with "active"', () => {
			layersState.displayAnnotationsLayer = false;
			actions = hot('--a--', { a: new SetAnnotationsLayer('annotationLayer') });
			const expectedResult = cold('--b--', {
				b: new AnnotationVisualizerAgentAction({
					action: 'show',
					maps: 'active'
				})
			});
			expect(visualizersAnnotationsAppEffects.annotationData$).toBeObservable(expectedResult);
		});
	});

	describe('class functions', () => {

		describe('relevantMapIds should filter maps via "releventMaps" value("all, "others", "active")', () => {
			const mapState = <IMapState> {
				activeMapId: 'activeMapId',
				mapsList: [{ id: 'activeMapId' }, { id: 'map1' }, { id: 'map2' }]
			};

			it('"all" should include all maps', () => {
				const result = visualizersAnnotationsAppEffects.relevantMapIds('all', mapState);
				expect(result).toEqual(['activeMapId', 'map1', 'map2']);
			});

			it('"others" should not include active map', () => {
				const result = visualizersAnnotationsAppEffects.relevantMapIds('others', mapState);
				expect(result).toEqual(['map1', 'map2']);
			});

			it('"active" should include only active map', () => {
				const result = visualizersAnnotationsAppEffects.relevantMapIds('active', mapState);
				expect(result).toEqual(['activeMapId']);
			});

		});

		it('annotationVisualizers should get ids array and return annotation visualizers array', () => {
			const annotationVisualizers: any[] = [
				{
					id: 'v1',
					getVisualizer: () => 'v1Visualizer'
				},
				{
					id: 'v2',
					getVisualizer: () => 'v2Visualizer'
				}
			];
			spyOn(imageryCommunicatorService, 'provide').and.callFake((_id) => annotationVisualizers.find(({ id }) => id === _id));
			const ids = ['v1', 'v2', 'v3'];
			const result: any[] = visualizersAnnotationsAppEffects.annotationVisualizers(ids);
			expect(result).toEqual(['v1Visualizer', 'v2Visualizer']);
		});
	});
});
