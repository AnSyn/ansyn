import { SelectLayerAction, UnselectLayerAction } from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { ILayerTreeNodeLeaf } from '@ansyn/menu-items/layers-manager/models/layer-tree-node-leaf';

import { async, inject, TestBed } from '@angular/core/testing';
import { CasesReducer, CasesService, ICasesState, UpdateCaseAction } from '@ansyn/menu-items/cases';
import { Store, StoreModule } from '@ngrx/store';
import { MapAppEffects } from './map.app.effects';
import { BaseMapSourceProvider, ConfigurationToken, ImageryCommunicatorService } from '@ansyn/imagery';
import { Observable } from 'rxjs/Observable';
import {
	ActiveMapChangedAction,
	CompositeMapShadowAction,
	StartMapShadowAction,
	StopMapShadowAction
} from '@ansyn/map-facade';
import { cloneDeep } from 'lodash';
import { StartMouseShadow, StopMouseShadow } from '@ansyn/menu-items/tools';
import {
	AddMapInstanceAction,
	AddOverlayToLoadingOverlaysAction,
	EnableMapGeoOptionsActionStore,
	MapSingleClickAction,
	RemoveOverlayFromLoadingOverlaysAction,
	SynchronizeMapsAction
} from '@ansyn/map-facade/actions/map.actions';
import { OverlaysConfig, OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { BaseOverlaySourceProvider, IFetchParams } from '@ansyn/overlays';
import {
	IStatusBarState,
	statusBarFlagsItems,
	StatusBarInitialState,
	StatusBarReducer,
	statusBarStateSelector
} from '@ansyn/status-bar/reducers/status-bar.reducer';
import { UpdateStatusFlagsAction } from '@ansyn/status-bar/actions/status-bar.actions';
import { SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import {
	DisplayOverlayAction,
	DisplayOverlaySuccessAction,
	LoadOverlaysAction,
	RequestOverlayByIDFromBackendAction
} from '@ansyn/overlays/actions/overlays.actions';
import { Case } from '@ansyn/menu-items/cases/models/case.model';
import { Overlay } from '@ansyn/overlays/models/overlay.model';
import * as utils from '@ansyn/core/utils';
import { CommunicatorEntity } from '@ansyn/imagery/communicator-service/communicator.entity';
import { IMapState, initialMapState, MapReducer, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { AnnotationVisualizerAgentAction } from '@ansyn/menu-items/tools/actions/tools.actions';
import {
	IOverlaysState,
	OverlayReducer,
	overlaysInitialState,
	overlaysStateSelector
} from '@ansyn/overlays/reducers/overlays.reducer';
import { PinPointTriggerAction } from '@ansyn/map-facade/actions';
import { HttpClientModule } from '@angular/common/http';
import { cold, hot } from 'jasmine-marbles';
import { provideMockActions } from '@ngrx/effects/testing';
import { casesStateSelector } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { getPolygonByPoint } from '@ansyn/core/utils/geo';
import { mapFacadeConfig } from '@ansyn/map-facade/models/map-facade.config';

class SourceProviderMock1 implements BaseMapSourceProvider {
	mapType = 'mapType1';
	sourceType = 'sourceType1';

	create(metaData: any): any {
		return true;
	}

	createAsync(metaData: any): Promise<any> {
		return Promise.resolve();
	}

	startTimingLog = key => {
	};

	endTimingLog = key => {
	};

}

class OverlaySourceProviderMock extends BaseOverlaySourceProvider {
	sourceType = 'Mock';

	public fetch(fetchParams: IFetchParams): Observable<Overlay[]> {
		return Observable.empty();
	}

	public getStartDateViaLimitFasets(params: { facets, limit, region }): Observable<any> {
		return Observable.empty();
	};

	public getById(id: string): Observable<Overlay> {
		return Observable.empty();
	};
}

describe('MapAppEffects', () => {
	let mapAppEffects: MapAppEffects;
	let actions: Observable<any>;
	let imageryCommunicatorService: ImageryCommunicatorService;
	let store: Store<any>;
	let icaseState: ICasesState;
	let statusBarState: IStatusBarState;
	let mapState: IMapState;
	let overlaysState: IOverlaysState;
	let casesService: CasesService;
	let baseSourceProviders: BaseMapSourceProvider[];
	let imageryCommunicatorServiceMock = {
		provide: () => {
		},
		communicatorsAsArray: () => {
		}
	};
	let fake_overlay: Overlay;

	const imagery1PositionBoundingBox = { test: 1 };

	const cases: Case[] = [{
		state: {
			time: { type: '', from: new Date(), to: new Date() },
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
					{
						id: 'imagery1',
						data: { position: { zoom: 1, center: 2, boundingBox: imagery1PositionBoundingBox } }
					},
					{ id: 'imagery2', data: { position: { zoom: 3, center: 4 }, overlayDisplayMode: 'Hitmap' } },
					{ id: 'imagery3', data: { position: { zoom: 5, center: 6 } } }
				],
				active_map_id: 'imagery1'
			}
		} as any
	}];

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule,

				StoreModule.forRoot({
					cases: CasesReducer,
					status_bar: StatusBarReducer,
					overlays: OverlayReducer,
					map: MapReducer
				})],
			providers: [
				MapAppEffects,
				OverlaysService,
				{ provide: BaseMapSourceProvider, useClass: SourceProviderMock1, multi: true },
				{
					provide: mapFacadeConfig,
					useValue: {}
				},
				{
					provide: OverlaysConfig, useValue: {
					'baseUrl': 'http://localhost:9001/api/v1/',
					'overlaysByCaseId': 'case/:id/overlays',
					'overlaysByTimeAndPolygon': 'overlays/find',
					'defaultApi': 'overlays',
					'searchByCase': false,
					'overlaySource': 'IDAHO',
					'polygonGenerationDistance': 0.1
				}
				},
				{
					provide: ConfigurationToken, useValue: {
					'geoMapsInitialMapSource': [{
						'mapType': 'openLayersMap',
						'mapSource': 'BING',
						'mapSourceMetadata': {
							'key': 'AsVccaM44P5n-GYKXaV0oVGdTI665Qx_sMgYBSYRxryH2pLe92iVxUgEtwIt8des',
							'styles': ['Aerial']
						}
					}, {
						'mapType': 'cesiumMap',
						'mapSource': 'OSM',
						'mapSourceMetadata': null
					}]
				}
				},
				{ provide: BaseOverlaySourceProvider, useClass: OverlaySourceProviderMock },
				{
					provide: ImageryCommunicatorService,
					useValue: imageryCommunicatorServiceMock
				},
				provideMockActions(() => actions),
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
		const selectedCase = cases[0];
		icaseState = { cases, selectedCase } as any;
		statusBarState = cloneDeep(StatusBarInitialState);
		mapState = cloneDeep(initialMapState);
		overlaysState = cloneDeep(overlaysInitialState);
		fake_overlay = <any>{ id: 'overlayId', isFullOverlay: true, isGeoRegistered: true };
		overlaysState.overlays.set(fake_overlay.id, fake_overlay);
		mapState.mapsList = [...icaseState.selectedCase.state.maps.data];
		mapState.activeMapId = icaseState.selectedCase.state.maps.active_map_id;
		const fakeStore = new Map<any, any>([
			[casesStateSelector, icaseState],
			[statusBarStateSelector, statusBarState],
			[overlaysStateSelector, overlaysState],
			[mapStateSelector, mapState]
		]);

		spyOn(store, 'select').and.callFake(type => {
			return Observable.of(fakeStore.get(type));
		});
	}));

	beforeEach(inject([MapAppEffects, ImageryCommunicatorService, CasesService, BaseMapSourceProvider], (_mapAppEffects: MapAppEffects, _imageryCommunicatorService: ImageryCommunicatorService, _casesService: CasesService, _baseSourceProviders: BaseMapSourceProvider[]) => {
		mapAppEffects = _mapAppEffects;

		imageryCommunicatorService = _imageryCommunicatorService;
		casesService = _casesService;
		baseSourceProviders = _baseSourceProviders;
	}));

	it('should be defined', () => {
		expect(mapAppEffects).toBeTruthy();
	});

	it('onMapSingleClick$ effect', () => {
		statusBarState.flags.set(statusBarFlagsItems.pinPointSearch, true);
		statusBarState.flags.set(statusBarFlagsItems.pinPointIndicator, true);
		const imagery1 = {
			removeSingleClickEvent: () => {
			}
		};
		spyOn(imageryCommunicatorService, 'communicatorsAsArray').and.callFake(() => [imagery1, imagery1, imagery1]);
		spyOn(imagery1, 'removeSingleClickEvent');
		const lonLat = [-70.33666666666667, 25.5];
		actions = hot('--a--', { a: new MapSingleClickAction({ lonLat }) });
		const a = new UpdateStatusFlagsAction({ key: statusBarFlagsItems.pinPointSearch, value: false });
		const b = new PinPointTriggerAction(lonLat);
		const expectedResults = cold('--(ab)--', { a, b });
		expect(mapAppEffects.onMapSingleClick$).toBeObservable(expectedResults);
		expect(imagery1.removeSingleClickEvent['calls'].count()).toBe(3);
	});

	it('onPinPointTrigger$ effect', () => {
		statusBarState.flags.set(statusBarFlagsItems.pinPointSearch, true);
		statusBarState.flags.set(statusBarFlagsItems.pinPointIndicator, true);
		const imagery1 = {
			addPinPointIndicator: () => {
			}
		};
		spyOn(imageryCommunicatorService, 'communicatorsAsArray').and.callFake(() => [imagery1, imagery1, imagery1]);
		spyOn(imagery1, 'addPinPointIndicator');
		const lonLat = [-70.33666666666667, 25.5];
		actions = hot('--a--', { a: new PinPointTriggerAction(lonLat) });
		const region = getPolygonByPoint(lonLat).geometry;
		const a = new UpdateCaseAction({
			...icaseState.selectedCase,
			state: { ...icaseState.selectedCase.state, region }
		});

		const b = new LoadOverlaysAction({
			to: icaseState.selectedCase.state.time.to,
			from: icaseState.selectedCase.state.time.from,
			polygon: region,
			caseId: icaseState.selectedCase.id
		});

		const expectedResults = cold('--(ab)--', { a, b });
		expect(mapAppEffects.onPinPointTrigger$).toBeObservable(expectedResults);
		expect(imagery1.addPinPointIndicator['calls'].count()).toBe(3);
	});

	it('addVectorLayer$ should add the selected Layer to the map', () => {
		const staticLeaf = <ILayerTreeNodeLeaf> {};
		const imagery1 = {
			addVectorLayer: () => {
			}
		};
		spyOn(imageryCommunicatorService, 'provide').and.callFake(() => imagery1);
		spyOn(imagery1, 'addVectorLayer');

		actions = hot('--a--', { a: new SelectLayerAction(staticLeaf) });
		const expectedResults = cold('--b--', { b: new SelectLayerAction(staticLeaf) });
		expect(mapAppEffects.addVectorLayer$).toBeObservable(expectedResults);
		expect(imagery1.addVectorLayer).toHaveBeenCalledWith(staticLeaf);
	});

	it('removeVectorLayer$ should remove the unselected Layer to the map', () => {
		let staticLeaf = <ILayerTreeNodeLeaf> {};

		let action: UnselectLayerAction = new UnselectLayerAction(staticLeaf);
		let imagery1 = {
			removeVectorLayer: () => {
			}
		};
		spyOn(imageryCommunicatorService, 'provide').and.callFake(() => imagery1);
		spyOn(imagery1, 'removeVectorLayer');
		actions = hot('--a--', { a: action });
		const expectedResults = cold('--b--', { b: action });
		expect(mapAppEffects.removeVectorLayer$).toBeObservable(expectedResults);
		expect(imagery1.removeVectorLayer).toHaveBeenCalledWith(staticLeaf);
	});

	it('onCommunicatorChange$ return action composite map shadow', () => {
		const communicators: Array<string> = ['imagery1', 'imagery2', 'imagery3'];
		actions = hot('--a--', {
			a: new AddMapInstanceAction({
				currentCommunicatorId: 'imagery2',
				communicatorsIds: communicators
			})
		});
		const a = new CompositeMapShadowAction();
		const b = new AnnotationVisualizerAgentAction({ maps: 'all', action: 'show' });
		const expectedResults = cold('--(ab)--', { a, b });
		expect(mapAppEffects.onCommunicatorChange$).toBeObservable(expectedResults);
	});

	it('onAddCommunicatorShowPinPoint$ on add communicator show pinpoint', () => {
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
		const action = new AddMapInstanceAction({
			communicatorsIds: ['tmpId1', 'tmpId2'],
			currentCommunicatorId: 'tmpId2'
		});
		actions = hot('--a--', { a: action });
		const expectedResults = cold('--b--', { b: action });
		expect(mapAppEffects.onAddCommunicatorShowPinPoint$).toBeObservable(expectedResults);

		expect(communicator.addPinPointIndicator).toHaveBeenCalled();
		expect(communicator.createMapSingleClickEvent).toHaveBeenCalled();
	});

	it('onStartMapShadow$ listen to start map shadow action', () => {
		actions = hot('--a--', { a: new StartMouseShadow() });
		const expectedResults = cold('--b--', { b: new StartMapShadowAction() });
		expect(mapAppEffects.onStartMapShadow$).toBeObservable(expectedResults);
	});

	describe('onEndMapShadow$', () => {
		it('listen to stop map shadow action', () => {
			actions = hot('--a--', { a: new StopMouseShadow() });
			const expectedResults = cold('--b--', { b: new StopMapShadowAction() });
			expect(mapAppEffects.onEndMapShadow$).toBeObservable(expectedResults);
		});
	});

	describe('onAddCommunicatorInitPlugin$', () => {
		it('on add communicator set pluggin with data', () => {
			const plugin = {
				init: () => {
				},
			};

			const communicator = {
				getPlugin: () => {
				},
			};
			spyOn(imageryCommunicatorService, 'provide').and.callFake(() => communicator);
			spyOn(communicator, 'getPlugin').and.callFake(() => plugin);
			spyOn(plugin, 'init');
			const action = new AddMapInstanceAction({
				communicatorsIds: ['tmpId1'],
				currentCommunicatorId: 'tmpId1'
			});
			actions = hot('--a--', { a: action });
			const expectedResults = cold('--b--', { b: action });
			expect(mapAppEffects.onAddCommunicatorInitPlugin$).toBeObservable(expectedResults);
			expect(communicator.getPlugin).toHaveBeenCalled();
			expect(plugin.init).toHaveBeenCalled();
		});
	});

	describe('onSynchronizeAppMaps$', () => {
		it('listen to SynchronizeMapsAction', () => {
			const communicator = {
				setPosition: () => {
				},
				getPosition: () => {
					return {};
				}
			};

			spyOn(imageryCommunicatorService, 'provide').and.callFake(() => communicator);
			spyOn(communicator, 'setPosition');
			const action = new SynchronizeMapsAction({ mapId: 'imagery1' });
			actions = hot('--a--', { a: action });
			const expectedResults = cold('--b--', { b: action });
			expect(mapAppEffects.onSynchronizeAppMaps$).toBeObservable(expectedResults);
			expect(communicator.setPosition).toHaveBeenCalled();
		});
	});

	describe('onDisplayOverlay$ communicator should set Layer on map, by getFootprintIntersectionRatioInExtent', () => {
		const fake_layer = {};
		const fake_extent = [1, 2, 3, 4];
		let fakeCommunicator: CommunicatorEntity;

		beforeEach(() => {
			fakeCommunicator = <any> {
				ActiveMap: { MapType: 'ol' },
				resetView: () => {
				}
			};

			const fakeSourceLoader = {
				createAsync: () => {
					return {
						then: (callback) => callback(fake_layer)
					};
				}
			};


			Object.defineProperty(utils, 'calcGeoJSONExtent', {
				writable: true,
				configurable: true,
				value: () => {
				}
			});

			spyOn(utils, 'calcGeoJSONExtent').and.returnValue(fake_extent);
			spyOn(imageryCommunicatorService, 'provide').and.returnValue(fakeCommunicator);
			spyOn(baseSourceProviders, 'find').and.returnValue(fakeSourceLoader);
			spyOn(fakeCommunicator, 'resetView');
		});

		it('setOverlayAsLoading$ is called', () => {
			actions = hot('--a--', { a: new DisplayOverlayAction({ overlay: fake_overlay, map_id: 'imagery1' }) });
			const expectedResults = cold('--b--', { b: new AddOverlayToLoadingOverlaysAction(fake_overlay.id) });
			expect(mapAppEffects.setOverlayAsLoading$).toBeObservable(expectedResults);
		});

		it('should NOT dispatch/do anything if "overlay.isFullOverlay = false"', () => {
			const testOverlay: Overlay = {
				id: 'test_overlay_id',
				name: 'testOverlay1',
				photoTime: new Date().toDateString(),
				date: null,
				azimuth: 0,
				isFullOverlay: false,
				isGeoRegistered: true
			};
			actions = hot('--a--', { a: new DisplayOverlayAction({ overlay: testOverlay, map_id: 'imagery1' }) });
			const expectedResults = cold('-');
			expect(mapAppEffects.onDisplayOverlay$).toBeObservable(expectedResults);
		});
	});

	describe('onOverlayFromURL$', () => {
		it('should dispatch RequestOverlayByIDFromBackendAction if "overlay.isFullOverlay = false"', () => {
			const testOverlay: Overlay = {
				id: 'test_overlay_id',
				name: 'testOverlay1',
				photoTime: new Date().toDateString(),
				date: null,
				azimuth: 0,
				isFullOverlay: false,
				isGeoRegistered: true
			};
			actions = hot('--a--', { a: new DisplayOverlayAction({ overlay: testOverlay, map_id: 'imagery1' }) });

			const expectedResults = cold('--b--', {
				b: new RequestOverlayByIDFromBackendAction({
					overlayId: testOverlay.id,
					map_id: 'imagery1'
				})
			});

			expect(mapAppEffects.onOverlayFromURL$).toBeObservable(expectedResults);
		});

		it('should NOT dispatch anything if "overlay.isFullOverlay = true"', () => {
			const testOverlay: Overlay = {
				id: 'test_overlay_id',
				name: 'testOverlay1',
				photoTime: new Date().toDateString(),
				date: null,
				azimuth: 0,
				isFullOverlay: true,
				isGeoRegistered: true
			};
			icaseState.selectedCase.state.maps.data[0].data.overlay = testOverlay;
			actions = hot('--a--', { a: new DisplayOverlayAction({ overlay: testOverlay, map_id: 'imagery1' }) });
			const expectedResults = cold('-');
			expect(mapAppEffects.onOverlayFromURL$).toBeObservable(expectedResults);
		});
	});

	describe('overlayLoadingSuccess$', () => {
		it('should dispatch RemoveOverlayFromLoadingOverlaysAction and OverlaysMarkupAction', () => {
			icaseState.selectedCase.state.maps.data[0].data.overlay = {
				id: 'test_overlay_id',
				name: 'testOverlay1',
				photoTime: new Date().toDateString(),
				date: null,
				azimuth: 0,
				isFullOverlay: true,
				isGeoRegistered: true
			};
			actions = hot('--a--', { a: new DisplayOverlaySuccessAction({ id: 'test_overlay_id' }) });
			const expectedResults = cold('--b--', { b: new RemoveOverlayFromLoadingOverlaysAction('test_overlay_id') });
			expect(mapAppEffects.overlayLoadingSuccess$).toBeObservable(expectedResults);
		});
	});

	describe('displayOverlayOnNewMapInstance$', () => {
		it('displayOverlayOnNewMapInstance$ should dispatch DisplayOverlayAction when communicator added that contains overlay', () => {
			const overlay = {
				id: 'test_overlay_id',
				name: 'testOverlay1',
				photoTime: new Date().toDateString(),
				date: null,
				azimuth: 0,
				isFullOverlay: true,
				isGeoRegistered: true
			};
			icaseState.selectedCase.state.maps.data[0].data.overlay = overlay;

			const communicators: Array<string> = ['imagery1'];
			actions = hot('--a--', {
				a: new AddMapInstanceAction({
					currentCommunicatorId: 'imagery1',
					communicatorsIds: communicators
				})
			});
			const expectedResults = cold('--b--', { b: new DisplayOverlayAction({ overlay, map_id: 'imagery1' }) });
			expect(mapAppEffects.displayOverlayOnNewMapInstance$).toBeObservable(expectedResults);
		});

		it('should not dispatch DisplayOverlayAction when communicator added that doesnt contain overlay', () => {
			icaseState.selectedCase.state.maps.data[1].data.overlay = null;
			const communicators: Array<string> = ['imagery2'];
			actions = hot('--a--', {
				a: new AddMapInstanceAction({
					currentCommunicatorId: 'imagery2',
					communicatorsIds: communicators
				})
			});
			const expectedResults = cold('-');
			expect(mapAppEffects.displayOverlayOnNewMapInstance$).toBeObservable(expectedResults);
		});
	});

	describe('displayOverlayFromCase$', () => {
		it('After case is selected/loaded should dispatch DisplayOverlayAction for each map that has overlay', () => {
			const testOverlay: Overlay = {
				id: 'test_overlay_id1',
				name: 'testOverlay1',
				photoTime: new Date().toDateString(),
				date: null,
				azimuth: 0,
				isFullOverlay: true,
				isGeoRegistered: true
			};
			mapState.mapsList[0].data.overlay = testOverlay;
			mapState.mapsList[1].data.overlay = testOverlay;

			const fakeCommuincator = { id: 'test' };
			spyOn(imageryCommunicatorService, 'provide').and.returnValue(fakeCommuincator);
			actions = hot('--a--', { a: new SelectCaseAction(icaseState.selectedCase) });
			const a = new DisplayOverlayAction({ overlay: testOverlay, map_id: mapState.mapsList[0].id });
			const b = new DisplayOverlayAction({ overlay: testOverlay, map_id: mapState.mapsList[1].id });
			const expectedResults = cold('--(ab)--', { a, b });
			expect(mapAppEffects.displayOverlayFromCase$).toBeObservable(expectedResults);
		});
	});

	describe('activeMapGeoRegistrationChanged$$', () => {
		it('After active map is changed should dispatch "EnableMapGeoOptionsActionStore" geoOpertions state', () => {
			const testOverlay: Overlay = { id: 'test_overlay_id1', isGeoRegistered: false } as Overlay;
			mapState.mapsList = <any> [
				{
					...icaseState.selectedCase.state.maps.data[0],
					data: { ...icaseState.selectedCase.state.maps.data[0].data, overlay: testOverlay }
				},
				{
					...icaseState.selectedCase.state.maps.data[1],
					data: { ...icaseState.selectedCase.state.maps.data[1].data, overlay: testOverlay }
				},
			];
			mapState.activeMapId = icaseState.selectedCase.state.maps.active_map_id;
			const fakeCommuincator = { id: 'test' };
			spyOn(imageryCommunicatorService, 'provide').and.returnValue(fakeCommuincator);
			actions = hot('--a--', { a: new ActiveMapChangedAction('') });
			const expectedResults = cold('--b--', {
				b: new EnableMapGeoOptionsActionStore({
					mapId: 'imagery1',
					isEnabled: false
				})
			});
			expect(mapAppEffects.activeMapGeoRegistrationChanged$$).toBeObservable(expectedResults);
		});
	});
});
