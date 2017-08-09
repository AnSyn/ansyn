import { SelectLayerAction, UnselectLayerAction } from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { ILayerTreeNodeLeaf } from '@ansyn/menu-items/layers-manager/models/layer-tree-node-leaf';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { async, inject, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { ICasesState, CasesReducer, UpdateCaseAction, CasesService } from '@ansyn/menu-items/cases';
import { Action, Store, StoreModule } from '@ngrx/store';
import { MapAppEffects } from './map.app.effects';
import { ImageryCommunicatorService, ConfigurationToken} from "@ansyn/imagery";
import { Observable } from 'rxjs/Observable';
import {  StopMapShadowAction, StartMapShadowAction, CompositeMapShadowAction, ActiveMapChangedAction } from '@ansyn/map-facade';
import { configuration } from "configuration/configuration";
import { BaseMapSourceProvider } from '@ansyn/imagery';
import { cloneDeep } from 'lodash';
import { StartMouseShadow, StopMouseShadow } from '@ansyn/menu-items/tools';
import { AddMapInstacneAction, MapSingleClickAction, SynchronizeMapsAction, AddOverlayToLoadingOverlaysAction, BackToWorldAction } from '@ansyn/map-facade/actions/map.actions';
import { OverlaysConfig, OverlaysService } from '@ansyn/overlays/services/overlays.service';
import {BaseOverlaySourceProvider, IFetchParams} from '@ansyn/overlays';
import {
	statusBarFlagsItems, StatusBarInitialState,
	StatusBarReducer
} from '@ansyn/status-bar/reducers/status-bar.reducer';
import { UpdateStatusFlagsAction } from '@ansyn/status-bar/actions/status-bar.actions';
import { CasesActionTypes, SelectCaseByIdAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { LoadOverlaysAction, DisplayOverlayAction, DisplayOverlaySuccessAction, OverlaysMarkupAction, RequestOverlayByIDFromBackendAction, OverlaysActionTypes } from '@ansyn/overlays/actions/overlays.actions';
import { OverlayReducer } from '@ansyn/overlays/reducers/overlays.reducer';
import { IOverlayState, overlayInitialState } from '@ansyn/overlays/reducers/overlays.reducer';
import { IStatusBarState } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { Case } from '@ansyn/menu-items/cases/models/case.model';
import { Overlay } from '@ansyn/overlays/models/overlay.model';
import * as utils from '@ansyn/core/utils';
import { CommunicatorEntity } from '@ansyn/imagery/communicator-service/communicator.entity';
import { RemoveOverlayFromLoadingOverlaysAction } from '@ansyn/map-facade/actions/map.actions';
import { ToolsActionsTypes } from '../../packages/menu-items/tools/actions/tools.actions';

class SourceProviderMock1 implements BaseMapSourceProvider {
	mapType= 'mapType1';
	sourceType = 'sourceType1';

	create(metaData: any): any {
		return true;
	}

	createAsync(metaData: any): Promise<any> {
		return Promise.resolve();
	}

	startTimingLog = key => {};

	endTimingLog = key => {};

}

class OverlaySourceProviderMock extends BaseOverlaySourceProvider{
	sourceType = "Mock";
	public fetch(fetchParams: IFetchParams): Observable<Overlay[]> {
		return Observable.empty();
	}

}

describe('MapAppEffects', () => {
	let mapAppEffects: MapAppEffects;
	let effectsRunner: EffectsRunner;
	let imageryCommunicatorService: ImageryCommunicatorService;
	let store: Store<any>;
	let icaseState: ICasesState;
	let statusBarState: IStatusBarState;
	let overlaysState: IOverlayState;
	let casesService: CasesService;
	let baseSourceProviders: BaseMapSourceProvider[];
	let imageryCommunicatorServiceMock = {
		provide:() => {},
		communicatorsAsArray:() => {}
	};
	let fake_overlay: Overlay;

	const imagery1PositionBoundingBox = {test: 1};

	const cases: Case[] = [{
		state: {
			time: { type: '',from: new Date(), to: new Date()},
			region: {
				type: 'Polygon',
				coordinates: [
					[
						[-64.73, 32.31],
						[-80.19, 25.76],
						[-66.09, 18.43],
						[-64.73, 32.31]
					]
				]
			},
			maps: {
				data: [
					{id: 'imagery1', data: {position: {zoom: 1, center: 2, boundingBox: imagery1PositionBoundingBox}}},
					{id: 'imagery2', data: {position: {zoom: 3, center: 4}, overlayVisualizerType: 'Hitmap'}},
					{id: 'imagery3', data: {position: {zoom: 5, center: 6}}}
				],
				active_map_id: 'imagery1'
			}
		} as any
	}];

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpModule,
				EffectsTestingModule,
				StoreModule.provideStore({ cases: CasesReducer,status_bar: StatusBarReducer ,overlays: OverlayReducer })],
			providers: [
				MapAppEffects,
				OverlaysService,
				{ provide: BaseMapSourceProvider, useClass: SourceProviderMock1 , multi: true},
				{ provide: OverlaysConfig, useValue: configuration.OverlaysConfig },
				{ provide: ConfigurationToken, useValue: configuration.ImageryConfig },
				{ provide: BaseOverlaySourceProvider, useClass :OverlaySourceProviderMock},
				{
					provide: ImageryCommunicatorService,
					useValue: imageryCommunicatorServiceMock
				},
				{
					provide: CasesService,
					useValue: {
						updateCase: () => null,
						wrapUpdateCase: () => null,
						getOverlaysMarkup: () => null
					}
				}
			]

		}).compileComponents();
	}));

	/* store data mock */
	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
		const selected_case = cases[0];
		icaseState = {cases, selected_case} as any;
		statusBarState = cloneDeep(StatusBarInitialState);
		overlaysState = cloneDeep(overlayInitialState);
		fake_overlay = <any>{id: 'overlayId', isFullOverlay: true};
		overlaysState.overlays.set(fake_overlay.id, fake_overlay);

		const fakeStore = {cases: icaseState, status_bar: statusBarState, overlays: overlaysState};

		spyOn(store, 'select').and.callFake(type => {
			return Observable.of(fakeStore[type]);
		});
	}));

	beforeEach(inject([MapAppEffects, EffectsRunner, ImageryCommunicatorService, CasesService, BaseMapSourceProvider], (_mapAppEffects: MapAppEffects, _effectsRunner: EffectsRunner, _imageryCommunicatorService: ImageryCommunicatorService, _casesService: CasesService, _baseSourceProviders: BaseMapSourceProvider[]) => {
		mapAppEffects = _mapAppEffects;
		effectsRunner = _effectsRunner;
		imageryCommunicatorService = _imageryCommunicatorService;
		casesService = _casesService;
		baseSourceProviders = _baseSourceProviders;
	}));

	it('should be defined', () => {
		expect(mapAppEffects).toBeTruthy();
	});

	it('onMapSingleClick$ effect',() => {
		statusBarState.flags.set(statusBarFlagsItems.pinPointSearch, true);
		statusBarState.flags.set(statusBarFlagsItems.pinPointIndicator, true);
		//mock communicatorsAsArray
		const imagery1 = {
			addPinPointIndicator: () => {},
			removeSingleClickEvent: () => {}
		};
		spyOn(imageryCommunicatorService, 'communicatorsAsArray').and.callFake(() => [imagery1,imagery1,imagery1]);
		spyOn (imagery1,'addPinPointIndicator');
		spyOn (imagery1,'removeSingleClickEvent');

		const action = new MapSingleClickAction({
			lonLat: [ -70.33666666666667, 25.5 ]
		});

		effectsRunner.queue(action);
		mapAppEffects.onMapSingleClick$.concat().subscribe( (_result:Action) => {
			let result = _result instanceof UpdateStatusFlagsAction || _result instanceof UpdateCaseAction || _result instanceof LoadOverlaysAction;
			expect(result).toBe(true);
			if(_result instanceof UpdateStatusFlagsAction ){
				expect(_result.payload.key).toEqual(statusBarFlagsItems.pinPointSearch);
				expect(_result.payload.value).toEqual(false);
			}
			if(_result instanceof UpdateCaseAction ){
				expect(_result.payload.state.region).not.toEqual(icaseState.selected_case.state.region);
				icaseState.selected_case = _result.payload;
			}
			if(_result instanceof LoadOverlaysAction){
				expect (_result.payload).toEqual({
					to: icaseState.selected_case.state.time.to,
					from: icaseState.selected_case.state.time.from,
					polygon:icaseState.selected_case.state.region,
					caseId: icaseState.selected_case.id
				})
			}
		});

		expect(imagery1.addPinPointIndicator['calls'].count()).toBe(3);
		expect(imagery1.removeSingleClickEvent['calls'].count()).toBe(3);
	});

	it('addVectorLayer$ should add the selected Layer to the map', () => {
		const staticLeaf: ILayerTreeNodeLeaf = {
			name: 'staticLayer',
			id: 'staticLayerId',
			isChecked: false,
			url: 'fake_url',
			isIndeterminate: false,
			children: []
		};

		const action: SelectLayerAction = new SelectLayerAction(staticLeaf);
		const imagery1 = {
			addVectorLayer: () => {

			}
		};
		effectsRunner.queue(action);
		spyOn(imageryCommunicatorService, 'provide').and.callFake(() => imagery1);
		spyOn(imagery1, 'addVectorLayer');

		mapAppEffects.addVectorLayer$.subscribe(() => {
			expect(imagery1.addVectorLayer).toHaveBeenCalledWith(staticLeaf);
		});
	});

	it('removeVectorLayer$ should remove the unselected Layer to the map', () => {
		let staticLeaf: ILayerTreeNodeLeaf = {
			name: 'staticLayer',
			id: 'staticLayerId',
			isChecked: false,
			url: 'fake_url',
			isIndeterminate: false,
			children: []
		};

		let action: UnselectLayerAction = new UnselectLayerAction(staticLeaf);
		let imagery1 = {
			removeVectorLayer: () => {

			}
		};
		effectsRunner.queue(action);
		spyOn(imageryCommunicatorService, 'provide').and.callFake(() => imagery1);
		spyOn(imagery1, 'removeVectorLayer');

		mapAppEffects.removeVectorLayer$.subscribe(() => {
			expect(imagery1.removeVectorLayer).toHaveBeenCalledWith(staticLeaf);
		});
	});

	describe('onCommunicatorChange$', () => {
		it('on communicator changes return action composite map shadow', () => {
			const communicators: Array<string> = ['imagery1'];

			communicators.push('imagery2');
			const expectedResult = new CompositeMapShadowAction();

			effectsRunner.queue(new AddMapInstacneAction({
				currentCommunicatorId: 'imagery2',
				communicatorsIds: communicators
			}));

			communicators.push('imagery3');
			effectsRunner.queue(new AddMapInstacneAction({
				currentCommunicatorId: 'imagery3',
				communicatorsIds: communicators
			}));

			let result = null;

			mapAppEffects.onCommunicatorChange$.subscribe(_result => {
				result = _result;
			});
			expect(result).toEqual(expectedResult);
		});
	});

	describe('onAddCommunicatorShowPinPoint$', () => {
		it('on add communicator show pinpoint', () => {
			statusBarState.flags.set(statusBarFlagsItems.pinPointSearch, true);
			statusBarState.flags.set(statusBarFlagsItems.pinPointIndicator, true);
			const communicator = {
				addPinPointIndicator: () => {
				},
				createMapSingleClickEvent: () => {
				}
			};
			spyOn(imageryCommunicatorService, 'provide').and.callFake(() => communicator);
			spyOn(communicator, 'addPinPointIndicator');
			spyOn(communicator, 'createMapSingleClickEvent');
			const action = new AddMapInstacneAction({
				communicatorsIds: ['tmpId1', 'tmpId2'],
				currentCommunicatorId: 'tmpId2'
			});
			effectsRunner.queue(action);
			mapAppEffects.onAddCommunicatorShowPinPoint$.subscribe();
			expect(communicator.addPinPointIndicator).toHaveBeenCalled();
			expect(communicator.createMapSingleClickEvent).toHaveBeenCalled();
		});
	});

	describe('onActiveMapChanges$', () => {

		it('on active map changes fire update case action', () => {
			spyOn(casesService, 'getOverlaysMarkup');
			effectsRunner.queue(new ActiveMapChangedAction('imagery2'));
			let count = 0;
			mapAppEffects.onActiveMapChanges$.subscribe((_result: Action) => {
				//expect(true).toBe(false);
				count++;
				if (_result.type === CasesActionTypes.UPDATE_CASE) {
					expect(_result.payload.state.maps.active_map_id).toBe('imagery2');
				}
				if (_result.type === OverlaysActionTypes.OVERLAYS_MARKUPS) {
					expect(casesService.getOverlaysMarkup).toHaveBeenCalled();
				}

				if (_result.type === ToolsActionsTypes.SET_ACTIVE_OVERLAYS_FOOTPRINT_MODE) {
					expect(_result.payload).toEqual('Hitmap');
				}
			});
			expect(count).toBe(3);
		});
	});

	describe('onStartMapShadow$', () => {
		it('listen to start map shadow action',() => {
			effectsRunner.queue(new StartMouseShadow());
			let result = null;
			mapAppEffects.onStartMapShadow$.subscribe(_result => {
				result = _result;
			});
			expect(result).toEqual(new StartMapShadowAction());
		});
	});

	describe('onEndMapShadow$', () => {
		it('listen to stop map shadow action', () => {
			effectsRunner.queue(new StopMouseShadow());
			let result = null;
			mapAppEffects.onEndMapShadow$.subscribe(_result => {
				result = _result;
			});
			expect(result).toEqual(new StopMapShadowAction());
		});
	});

	describe('onAddCommunicatorInitPlugin$', () => {
		it('on add communicator set pluggin with data' ,() => {
			const plugin = {
				init: () => {},
			}

			const communicator = {
				getPlugin: () => {},
			}
			spyOn(imageryCommunicatorService, 'provide').and.callFake(() => communicator);
			spyOn(communicator, 'getPlugin').and.callFake(() => plugin);
			spyOn(plugin, 'init');

			const action = new AddMapInstacneAction({
				communicatorsIds: ['tmpId1'],
				currentCommunicatorId: 'tmpId1'
			});
			effectsRunner.queue(action);
			mapAppEffects.onAddCommunicatorInitPlugin$.subscribe();
			expect(communicator.getPlugin).toHaveBeenCalled();
			expect(plugin.init).toHaveBeenCalled();
		});
	});

	describe('onSynchronizeAppMaps$', () => {
		it('listen to SynchronizeMapsAction',() => {
			const communicator = {
				setPosition: () => {},
			};

			spyOn(imageryCommunicatorService, 'provide').and.callFake(() => communicator);
			spyOn(communicator, 'setPosition');
			effectsRunner.queue(new SynchronizeMapsAction({mapId: "imagery1"}));
			mapAppEffects.onSynchronizeAppMaps$.subscribe();
			expect(communicator.setPosition).toHaveBeenCalled();
		});
	});

	describe('backToWorldView$', () => {
		it('listen to BackToWorldAction with overlay',() => {

			// data: [
			// 	{id: 'imagery1', data: {position: {zoom: 1, center: 2, boundingBox: imagery1PositionBoundingBox}}},
			// 	{id: 'imagery2', data: {position: {zoom: 3, center: 4}}},
			// 	{id: 'imagery3', data: {position: {zoom: 5, center: 6}}}
			// ],
			const testOverlay: Overlay = {id: 'testOverlay1', name: 'testOverlay1', photoTime: new Date().toDateString(), date: null, azimuth: 0, isFullOverlay: true};
			icaseState.selected_case.state.maps.data[0].data.overlay = testOverlay;
			const communicator = {
				loadInitialMapSource: () => {},
			};

			spyOn(imageryCommunicatorService, 'provide').and.callFake(() => communicator);
			spyOn(communicator, 'loadInitialMapSource');
			spyOn(casesService, 'getOverlaysMarkup');
			effectsRunner.queue(new BackToWorldAction({mapId: 'imagery1'}));
			mapAppEffects.backToWorldView$.subscribe(_result => {
				let result = _result instanceof UpdateCaseAction || _result instanceof OverlaysMarkupAction;
				expect(result).toBe(true);

				if(_result instanceof OverlaysMarkupAction){
					expect(casesService.getOverlaysMarkup).toHaveBeenCalled();
				}
				if(_result instanceof UpdateCaseAction ){
					const resultCase: Case = _result.payload;
					expect(resultCase.state.maps.data[0].data.overlay).toEqual(null);
				}
			});
			expect(communicator.loadInitialMapSource).toHaveBeenCalled();
		});
	});

	describe('onDisplayOverlay$ communicator should set Layer on map, by isExtentContainedInPolygon', () => {
		const fake_layer = {};
		const fake_extent = [1,2,3,4];
		let fakeCommuincator: CommunicatorEntity;

		beforeEach(()=> {

			fakeCommuincator = <any> {
				ActiveMap: {MapType: 'ol'},
				setLayer: () => {}
			};

			const fakeSourceLoader = {
				createAsync: () => {
					return {
						then: (callback) => callback(fake_layer)
					};
				}
			};


			Object.defineProperty(utils,'calcGeoJSONExtent',{
				writable: true,
				configurable: true,
				value: () => {}
			});

			spyOn(utils, 'calcGeoJSONExtent').and.returnValue(fake_extent);
			spyOn(imageryCommunicatorService, 'provide').and.returnValue(fakeCommuincator);
			spyOn(baseSourceProviders, 'find').and.returnValue(fakeSourceLoader);
			spyOn(fakeCommuincator, 'setLayer');
		});

		it('isExtentContainedInPolygon "false"', ()=> {

			Object.defineProperty(utils,'isExtentContainedInPolygon',{
				writable: true,
				configurable: true,
				value: () => {}
			});
			spyOn(utils, 'isExtentContainedInPolygon').and.returnValue(false);
			effectsRunner.queue(new DisplayOverlayAction({overlay: fake_overlay, map_id: 'imagery1'}));

			let subscribeResult = undefined;
			mapAppEffects.onDisplayOverlay$.subscribe(result=> {
				subscribeResult = result;
				expect(utils.calcGeoJSONExtent).toHaveBeenCalled();
				expect(fakeCommuincator.setLayer).toHaveBeenCalledWith(fake_layer, fake_extent);
			});
			expect(subscribeResult).toEqual(new DisplayOverlaySuccessAction({id: fake_overlay.id}));
		});

		it('isExtentContainedInPolygon "true"', ()=> {
			spyOn(utils, 'isExtentContainedInPolygon').and.returnValue(true);
			effectsRunner.queue(new DisplayOverlayAction({overlay: fake_overlay, map_id: 'imagery1'}));
			let subscribeResult = undefined;
			mapAppEffects.onDisplayOverlay$.subscribe(result=> {
				subscribeResult = result;
				expect(utils.calcGeoJSONExtent).not.toHaveBeenCalled();
				expect(fakeCommuincator.setLayer).toHaveBeenCalledWith(fake_layer, imagery1PositionBoundingBox);
			});
			expect(subscribeResult).toEqual(new DisplayOverlaySuccessAction({id: fake_overlay.id}));
		});

		it('setOverlayAsLoading$ is called', ()=> {
			effectsRunner.queue(new DisplayOverlayAction({overlay: fake_overlay, map_id: 'imagery1'}));
			let subscribeResult = undefined;
			mapAppEffects.setOverlayAsLoading$.subscribe(result=> {
				subscribeResult = result;
			});
			expect(subscribeResult).toEqual(new AddOverlayToLoadingOverlaysAction(fake_overlay.id));
		});

		it('should NOT dispatch/do anything if "overlay.isFullOverlay = false"',() => {
			const testOverlay: Overlay = {id: 'test_overlay_id', name: 'testOverlay1', photoTime: new Date().toDateString(), date: null, azimuth: 0, isFullOverlay: false};
			effectsRunner.queue(new DisplayOverlayAction({overlay: testOverlay, map_id: 'imagery1'}));

			const resultActions = [];
			mapAppEffects.onDisplayOverlay$.subscribe(_result => {
				resultActions.push(_result);
			});
			expect(resultActions.length).toEqual(0);
		});
	});

	describe('onOverlayFromURL$', () => {
		it('should dispatch RequestOverlayByIDFromBackendAction if "overlay.isFullOverlay = false"',() => {
			const testOverlay: Overlay = {id: 'test_overlay_id', name: 'testOverlay1', photoTime: new Date().toDateString(), date: null, azimuth: 0, isFullOverlay: false};
			effectsRunner.queue(new DisplayOverlayAction({overlay: testOverlay, map_id: 'imagery1'}));

			const resultActions = [];
			mapAppEffects.onOverlayFromURL$.subscribe(_result => {
				let result = _result instanceof RequestOverlayByIDFromBackendAction;
				expect(result).toBe(true);

				if (_result.type === OverlaysActionTypes.REQUEST_OVERLAY_FROM_BACKEND) {
					//const action = <RemoveOverlayFromLoadingOverlaysAction>_result;
					expect(_result.payload).toEqual({overlayId: testOverlay.id, map_id: 'imagery1'});
				}
				resultActions.push(_result);
			});
			expect(resultActions.length).toEqual(1);
		});

		it('should NOT dispatch anything if "overlay.isFullOverlay = true"',() => {
			const testOverlay: Overlay = {id: 'test_overlay_id', name: 'testOverlay1', photoTime: new Date().toDateString(), date: null, azimuth: 0, isFullOverlay: true};
			icaseState.selected_case.state.maps.data[0].data.overlay = testOverlay;
			effectsRunner.queue(new DisplayOverlayAction({overlay: testOverlay, map_id: 'imagery1'}));

			const resultActions = [];
			mapAppEffects.onOverlayFromURL$.subscribe(_result => {
				resultActions.push(_result);
			});
			expect(resultActions.length).toEqual(0);
		});
	});


	describe('overlayLoadingSuccess$', () => {
		it('should dispatch RemoveOverlayFromLoadingOverlaysAction and OverlaysMarkupAction',() => {
			const testOverlay: Overlay = {id: 'test_overlay_id', name: 'testOverlay1', photoTime: new Date().toDateString(), date: null, azimuth: 0, isFullOverlay: true};
			icaseState.selected_case.state.maps.data[0].data.overlay = testOverlay;
			effectsRunner.queue(new DisplayOverlaySuccessAction({id: 'test_overlay_id'}));

			const resultActions = [];
			spyOn(casesService, 'getOverlaysMarkup');
			mapAppEffects.overlayLoadingSuccess$.subscribe(_result => {
				let result = _result instanceof RemoveOverlayFromLoadingOverlaysAction || _result instanceof OverlaysMarkupAction;
				expect(result).toBe(true);

				if(_result instanceof RemoveOverlayFromLoadingOverlaysAction){
					//const action = <RemoveOverlayFromLoadingOverlaysAction>_result;
					expect(_result.payload).toEqual('test_overlay_id');
				}
				if (_result.type === OverlaysActionTypes.OVERLAYS_MARKUPS) {
					expect(casesService.getOverlaysMarkup).toHaveBeenCalled();
				}
				resultActions.push(_result);
			});
			expect(resultActions.length).toEqual(2);
		});
	});

	describe('displayOverlayOnNewMapInstance$', () => {
		it('should dispatch DisplayOverlayAction when communicator added that contains overlay',() => {

			const testOverlay: Overlay = {id: 'test_overlay_id', name: 'testOverlay1', photoTime: new Date().toDateString(), date: null, azimuth: 0, isFullOverlay: true};
			icaseState.selected_case.state.maps.data[0].data.overlay = testOverlay;

			const communicators: Array<string> = ['imagery1'];

			effectsRunner.queue(new AddMapInstacneAction({
				currentCommunicatorId: 'imagery1',
				communicatorsIds: communicators
			}));

			const resultActions = [];
			mapAppEffects.displayOverlayOnNewMapInstance$.subscribe(_result => {
				let result = _result instanceof DisplayOverlayAction;
				expect(result).toBe(true);
				expect(_result.payload.overlay.id).toEqual('test_overlay_id');
				expect(_result.payload.map_id).toEqual('imagery1');
				resultActions.push(_result);
			});
			expect(resultActions.length).toEqual(1);
		});

		it('should not dispatch DisplayOverlayAction when communicator added that doesnt contain overlay',() => {

			icaseState.selected_case.state.maps.data[1].data.overlay = null;

			const communicators: Array<string> = ['imagery2'];

			effectsRunner.queue(new AddMapInstacneAction({
				currentCommunicatorId: 'imagery2',
				communicatorsIds: communicators
			}));

			const displayActions = [];
			mapAppEffects.displayOverlayOnNewMapInstance$.subscribe(_result => {
				displayActions.push(_result);
			});
			expect(displayActions.length).toEqual(0);
		});
	});

	describe('displayOverlayFromCase$', () => {
		it('After case is selected/loaded should dispatch DisplayOverlayAction for each map that has overlay',() => {
			const testOverlay: Overlay = {id: 'test_overlay_id1', name: 'testOverlay1', photoTime: new Date().toDateString(), date: null, azimuth: 0, isFullOverlay: true};
			icaseState.selected_case.state.maps.data[0].data.overlay = testOverlay;
			icaseState.selected_case.state.maps.data[1].data.overlay = testOverlay;

			const fakeCommuincator = {id: 'test'};
			spyOn(imageryCommunicatorService, 'provide').and.returnValue(fakeCommuincator);

			effectsRunner.queue(new SelectCaseByIdAction(icaseState.selected_case.id));
			const displayActions = [];
			mapAppEffects.displayOverlayFromCase$.subscribe(_result => {
				let result = _result instanceof DisplayOverlayAction;
				expect(result).toBe(true);
				displayActions.push(result);
			});
			expect(displayActions.length).toEqual(2);
		});
	});
});
