// import { async, inject, TestBed } from '@angular/core/testing';
//
// import { Store, StoreModule } from '@ngrx/store';
// import { CasesReducer } from '@ansyn/menu-items/cases/reducers/cases.reducer';
// import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
// import { VisualizersAppEffects } from './visualizers.app.effects';
// import {
// 	DbclickFeatureTriggerAction,
// 	DrawOverlaysOnMapTriggerAction,
// 	HoverFeatureTriggerAction,
// 	MapActionTypes,
// 	SetMapsDataActionStore
// } from '@ansyn/map-facade/actions/map.actions';
// import {
// 	DisplayOverlayFromStoreAction,
// 	MouseOutDropAction,
// 	MouseOverDropAction,
// 	OverlaysMarkupAction,
// 	SetFiltersAction
// } from '@ansyn/overlays/actions/overlays.actions';
// import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
// import { AddCaseSuccessAction, SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
// import { Case } from '@ansyn/core/models/case.model';
// import { ShowOverlaysFootprintAction } from '@ansyn/menu-items/tools/actions/tools.actions';
// import { FootprintPolylineVisualizerType } from '@ansyn/open-layer-visualizers/overlays/polyline-visualizer';
// import { MapReducer } from '@ansyn/map-facade/reducers/map.reducer';
//
// describe('VisualizersAppEffects', () => {
// 	let visualizersAppEffects: VisualizersAppEffects;
// 	let store: Store<any>;
// 	let actions: Observable<any>;
// 	let imageryCommunicatorService: ImageryCommunicatorService;
//
// 	const selectedCase: Case = {
// 		id: '1234-5678',
// 		state:
// 			{
// 				maps:
// 					{
// 						active_map_id: 'active_map_id',
// 						data: [
// 							{
// 								id: 'active_map_id',
// 								data: {
// 									overlayDisplayMode: 'Polygon'
// 								}
// 							},
// 							{
// 								id: 'not_active_map_id',
// 								data: {}
// 							},
// 							{
// 								id: 'not_active_map_id',
// 								data: {}
// 							},
//
// 						]
// 					}
// 			}
// 	} as Case;
//
// 	beforeEach(async(() => {
// 		TestBed.configureTestingModule({
// 			imports: [
//
// 				StoreModule.forRoot({ cases: CasesReducer, map: MapReducer })
// 			],
// 			providers: [
// 				VisualizersAppEffects,
// 				ImageryCommunicatorService
// 			]
//
// 		}).compileComponents();
// 	}));
//
// 	beforeEach(inject([Store, VisualizersAppEffects,  ImageryCommunicatorService], (_store: Store<any>, _visualizersAppEffects: VisualizersAppEffects,  _imageryCommunicatorService: ImageryCommunicatorService) => {
// 		store = _store;
// 		visualizersAppEffects = _visualizersAppEffects;
//
// 		imageryCommunicatorService = _imageryCommunicatorService;
// 		store.dispatch(new AddCaseSuccessAction(selectedCase));
// 		store.dispatch(new SelectCaseAction(selectedCase));
// 		store.dispatch(new SetMapsDataActionStore({
// 			mapsList: selectedCase.state.maps.data,
// 			activeMapId: selectedCase.state.maps.active_map_id
// 		}));
// 	}));
//
// 	it('onHoverFeatureSetMarkup$ should call getOverlaysMarkup with overlay hoverId, result should be send as payload of OverlaysMarkupAction', () => {
// 		const markup = [{ id: '1234', class: 'active' }];
// 		spyOn(CasesService, 'getOverlaysMarkup').and.callFake(() => markup);
// 		effectsRunner.queue(new HoverFeatureTriggerAction({
// 			id: 'fakeId',
// 			visualizerType: FootprintPolylineVisualizerType
// 		}));
// 		let result;
// 		visualizersAppEffects.onHoverFeatureSetMarkup$.subscribe(_result => {
// 			result = _result;
// 		});
// 		expect(result.constructor).toEqual(OverlaysMarkupAction);
// 		expect(result.payload).toEqual(markup);
// 	});
//
// 	it('onHoverFeatureEmitSyncHoverFeature$ should call setHoverFeature per communicator FootprintPolylineVisualizerType', () => {
// 		const fakeVisualizer = {
// 			setHoverFeature: () => {
// 			}
// 		};
// 		const fakeCommunicator = {
// 			getVisualizer: (): any => fakeVisualizer
// 		};
// 		spyOn(fakeVisualizer, 'setHoverFeature');
// 		spyOn(imageryCommunicatorService, 'communicatorsAsArray').and.callFake(() => [fakeCommunicator, fakeCommunicator]);
// 		effectsRunner.queue(new HoverFeatureTriggerAction({
// 			id: 'fakeId',
// 			visualizerType: FootprintPolylineVisualizerType
// 		}));
// 		visualizersAppEffects.onHoverFeatureEmitSyncHoverFeature$.subscribe();
// 		expect(fakeCommunicator.getVisualizer().setHoverFeature).toHaveBeenCalledTimes(2);
// 	});
//
// 	describe('onMouseOverDropAction$ should return HoverFeatureTriggerAction (with "id" if MouseOverDropAction else "undefined")', () => {
//
// 		it('with "id" if MouseOverDropAction', () => {
// 			actions = hot('--a--', { a: new MouseOverDropAction('fakeId') });
// 			let result;
// 			visualizersAppEffects.onMouseOverDropAction$.subscribe((_result) => {
// 				result = _result;
// 			});
// 			expect(result.constructor).toEqual(HoverFeatureTriggerAction);
// 			expect(result.payload.id).toEqual('fakeId');
// 		});
//
// 		it('with "undefined" if not MouseOverDropAction', () => {
// 			actions = hot('--a--', { a: new MouseOutDropAction('fakeId') });
// 			let result;
// 			visualizersAppEffects.onMouseOverDropAction$.subscribe((_result) => {
// 				result = _result;
// 			});
// 			expect(result.constructor).toEqual(HoverFeatureTriggerAction);
// 			expect(result.payload.id).toBeUndefined();
// 		});
//
// 	});
//
// 	it('onDbclickFeaturePolylineDisplayAction$ should call displayOverlayFromStoreAction with id from payload', () => {
// 		effectsRunner.queue(new DbclickFeatureTriggerAction({
// 			id: 'fakeId',
// 			visualizerType: FootprintPolylineVisualizerType
// 		}));
// 		let result: DisplayOverlayFromStoreAction;
// 		visualizersAppEffects.onDbclickFeaturePolylineDisplayAction$.subscribe(_result => result = _result);
// 		expect(result.constructor).toEqual(DisplayOverlayFromStoreAction);
// 		expect(result.payload.id).toEqual('fakeId');
// 	});
//
// 	it('markupVisualizer$ should call setMarkupFeatures per communicator', () => {
// 		const fakeVisualizer = {
// 			setMarkupFeatures: () => {
// 			}
// 		};
// 		const fakeCommunicator = {
// 			getVisualizer: (): any => fakeVisualizer
// 		};
// 		spyOn(fakeVisualizer, 'setMarkupFeatures');
// 		spyOn(imageryCommunicatorService, 'communicatorsAsArray').and.callFake(() => [fakeCommunicator, fakeCommunicator, fakeCommunicator]);
// 		actions = hot('--a--', { a: new OverlaysMarkupAction([1, 2, 3, 4]) });
// 		visualizersAppEffects.markupVisualizer$.subscribe();
// 		expect(fakeCommunicator.getVisualizer().setMarkupFeatures).toHaveBeenCalledWith([1, 2, 3, 4]);
// 		expect(fakeCommunicator.getVisualizer().setMarkupFeatures).toHaveBeenCalledTimes(3);
// 	});
//
// 	it('Effect : updateCaseFromTools$ - with OverlayVisualizerMode === "Hitmap"', () => {
// 		actions = hot('--a--', { a: new ShowOverlaysFootprintAction('Hitmap') });
// 		let count = 0;
// 		visualizersAppEffects.updateCaseFromTools$.subscribe((_result: any) => {
// 			expect(_result.type === MapActionTypes.STORE.SET_MAPS_DATA || _result.type === MapActionTypes.DRAW_OVERLAY_ON_MAP).toBeTruthy();
// 			if (_result.type === MapActionTypes.STORE.SET_MAPS_DATA) {
// 				expect(_result.payload.mapsList[0].data.overlayDisplayMode).toBe('Hitmap');
// 			}
// 			count++;
// 		});
// 		expect(count).toBe(2);
// 	});
//
// 	it('shouldDrawOverlaysOnMap$ should return DrawOverlaysOnMapTriggerAction ( SET_FILTERS action) ', () => {
// 		actions = hot('--a--', { a: new SetFiltersAction({}) });
// 		let result;
// 		visualizersAppEffects.shouldDrawOverlaysOnMap$.subscribe(_result => {
// 			result = _result;
// 		});
// 		expect(result.constructor).toEqual(DrawOverlaysOnMapTriggerAction);
// 	});
//
// 	it('drawOverlaysOnMap$ should call drawOverlayOnMap() for each map(from selected case)', () => {
// 		spyOn(visualizersAppEffects, 'drawOverlaysOnMap');
// 		actions = hot('--a--', { a: new DrawOverlaysOnMapTriggerAction() });
// 		let result;
// 		visualizersAppEffects.drawOverlaysOnMap$.subscribe();
// 		expect(visualizersAppEffects.drawOverlaysOnMap).toHaveBeenCalledTimes(3);
// 	});
//
// });
