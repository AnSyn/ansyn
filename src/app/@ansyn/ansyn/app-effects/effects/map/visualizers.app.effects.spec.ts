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
	SelectCaseAction
} from '@ansyn/menu-items/cases/actions/cases.actions';
import { Case } from '@ansyn/core/models/case.model';
import {
	ShowOverlaysFootprintAction
} from '@ansyn/menu-items/tools/actions/tools.actions';
import { FootprintPolylineVisualizerType } from '@ansyn/plugins/openlayers/open-layer-visualizers/overlays/polyline-visualizer';
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
import { CoreService } from '@ansyn/core/services/core.service';
import { coreInitialState, coreStateSelector } from '@ansyn/core/reducers/core.reducer';
import { ClearActiveInteractionsAction } from '@ansyn/core';
import {
	AddCaseAction, SetAnnotationMode, SetMeasureDistanceToolState,
	SetPinLocationModeAction
} from '@ansyn/menu-items';
import { statusBarFlagsItems, UpdateStatusFlagsAction } from '@ansyn/status-bar';

describe('VisualizersAppEffects', () => {
	let visualizersAppEffects: VisualizersAppEffects;
	let store: Store<any>;
	let actions: Observable<any>;
	let imageryCommunicatorService: ImageryCommunicatorService = null;
	let coreState = coreInitialState;
	let caseState: ICasesState = cloneDeep(initialCasesState);
	let layersState: ILayerState = cloneDeep(initialLayersState);
	let mapState: IMapState = cloneDeep(initialMapState);

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
		store.dispatch(new AddCaseAction(selectedCase));
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
		spyOn(visualizersAppEffects, 'drawPinPointIconOnMap').and.callFake(() => Observable.of(true));
		const action = new DrawPinPointAction([-70.33666666666667, 25.5]);
		actions = hot('--a--', { a: action });
		// undefined because: drawPinPoint$ map don't have a return
		const expectedResults = cold('--b--', { b: undefined });

		expect(visualizersAppEffects.drawPinPoint$).toBeObservable(expectedResults);
		expect(visualizersAppEffects.drawPinPointIconOnMap).toHaveBeenCalledTimes(3);
	});


	it('clearActiveInteractions$ should clear active interactions', () => {
		actions = hot('--a--', { a: new ClearActiveInteractionsAction() });

		const expectedResult = cold('--(abcd)--', {
			a: new SetMeasureDistanceToolState(false),
			b: new SetAnnotationMode(),
			c: new UpdateStatusFlagsAction({ key: statusBarFlagsItems.pinPointSearch, value: false}),
			d: new SetPinLocationModeAction(false)
		});

		expect(visualizersAppEffects.clearActiveInteractions$).toBeObservable(expectedResult);
	});

	it('clearActiveInteractions$ should clear active interactions without SetMeasureDistanceToolState', () => {
		actions = hot('--a--', {
			a: new ClearActiveInteractionsAction({
				skipClearFor: [SetMeasureDistanceToolState]
			})
		});

		const expectedResult = cold('--(bcd)--', {
			b: new SetAnnotationMode(),
			c: new UpdateStatusFlagsAction({ key: statusBarFlagsItems.pinPointSearch, value: false}),
			d: new SetPinLocationModeAction(false)
		});

		expect(visualizersAppEffects.clearActiveInteractions$).toBeObservable(expectedResult);
	});
});
