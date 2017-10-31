import { async, inject, TestBed } from '@angular/core/testing';

import { Store, StoreModule } from '@ngrx/store';
import { casesFeatureKey, CasesReducer } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { VisualizersAppEffects } from './visualizers.app.effects';
import {
	DbclickFeatureTriggerAction,
	DrawOverlaysOnMapTriggerAction,
	HoverFeatureTriggerAction,
	SetMapsDataActionStore
} from '@ansyn/map-facade/actions/map.actions';
import {
	DisplayOverlayFromStoreAction,
	MouseOutDropAction,
	MouseOverDropAction,
	OverlaysMarkupAction,
	SetFiltersAction
} from '@ansyn/overlays/actions/overlays.actions';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { AddCaseSuccessAction, SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { Case } from '@ansyn/core/models/case.model';
import { ShowOverlaysFootprintAction } from '@ansyn/menu-items/tools/actions/tools.actions';
import { FootprintPolylineVisualizerType } from '@ansyn/open-layer-visualizers/overlays/polyline-visualizer';
import { mapFeatureKey, MapReducer } from '@ansyn/map-facade/reducers/map.reducer';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { Observable } from 'rxjs/Observable';
import { DrawPinPointAction } from "../../../packages/map-facade/actions/map.actions";

describe('VisualizersAppEffects', () => {
	let visualizersAppEffects: VisualizersAppEffects;
	let store: Store<any>;
	let actions: Observable<any>;
	let imageryCommunicatorService: ImageryCommunicatorService;

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
								id: 'notActiveMapId',
								data: {}
							},
							{
								id: 'notActiveMapId',
								data: {}
							},

						]
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

	beforeEach(inject([Store, VisualizersAppEffects, ImageryCommunicatorService], (_store: Store<any>, _visualizersAppEffects: VisualizersAppEffects, _imageryCommunicatorService: ImageryCommunicatorService) => {
		store = _store;
		visualizersAppEffects = _visualizersAppEffects;

		imageryCommunicatorService = _imageryCommunicatorService;
		store.dispatch(new AddCaseSuccessAction(selectedCase));
		store.dispatch(new SelectCaseAction(selectedCase));
		store.dispatch(new SetMapsDataActionStore({
			mapsList: selectedCase.state.maps.data,
			activeMapId: selectedCase.state.maps.activeMapId
		}));
	}));

	it('onHoverFeatureSetMarkup$ should call getOverlaysMarkup with overlay hoverId, result should be send as payload of OverlaysMarkupAction', () => {
		const markup = [{ id: '1234', class: 'active' }];
		spyOn(CasesService, 'getOverlaysMarkup').and.callFake(() => markup);
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
		const updatedMapsList = [...selectedCase.state.maps.data];
		updatedMapsList[0].data.overlayDisplayMode = 'Hitmap';
		actions = hot('--a--', { a: new ShowOverlaysFootprintAction('Hitmap') });
		const expectedResults = cold('--(ab)--', {
			a: new SetMapsDataActionStore({ mapsList: updatedMapsList }),
			b: new DrawOverlaysOnMapTriggerAction()
		});
		expect(visualizersAppEffects.updateCaseFromTools$).toBeObservable(expectedResults);
	});

	it('shouldDrawOverlaysOnMap$ should return DrawOverlaysOnMapTriggerAction ( SET_FILTERS action) ', () => {
		actions = hot('--a--', { a: new SetFiltersAction({}) });
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
