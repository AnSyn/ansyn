import { async, inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { MapAppEffects } from './map.app.effects';
import { EMPTY, Observable, of } from 'rxjs';
import { cloneDeep } from 'lodash';
import {
	ImageryCreatedAction,
	IMapState,
	initialMapState,
	mapFacadeConfig,
	mapFeatureKey,
	MapReducer,
	mapStateSelector,
	selectMaps,
	SetIsLoadingAcion
} from '@ansyn/map-facade';
import * as extentFromGeojson from '@ansyn/imagery';
import {
	BaseMapSourceProvider,
	CacheService,
	CommunicatorEntity, GetProvidersMapsService,
	IBaseImageryMapConstructor,
	IMAGERY_CONFIG,
	IMAGERY_MAPS,
	ImageryCommunicatorService,
	ImageryMapSource,
	IMapSettings,
	MAP_SOURCE_PROVIDERS_CONFIG,
	VisualizersConfig
} from '@ansyn/imagery';
import { HttpClientModule } from '@angular/common/http';
import { cold, hot } from 'jasmine-marbles';
import { provideMockActions } from '@ngrx/effects/testing';
import {
	casesFeatureKey,
	CasesReducer,
	casesStateSelector,
	ICasesState
} from '../../modules/menu-items/cases/reducers/cases.reducer';
import { casesConfig, CasesService } from '../../modules/menu-items/cases/services/cases.service';
import {
	ILayerState,
	initialLayersState,
	layersStateSelector
} from '../../modules/menu-items/layers-manager/reducers/layers.reducer';
import {
	IToolsState,
	toolsInitialState,
	toolsStateSelector
} from '../../modules/status-bar/components/tools/reducers/tools.reducer';
import {
	IStatusBarState,
	statusBarFeatureKey,
	StatusBarInitialState,
	StatusBarReducer,
	statusBarStateSelector
} from '../../modules/status-bar/reducers/status-bar.reducer';
import {
	IOverlaysState,
	OverlayReducer,
	overlaysFeatureKey,
	overlaysInitialState,
	overlaysStateSelector
} from '../../modules/overlays/reducers/overlays.reducer';
import {
	BaseOverlaySourceProvider,
	IFetchParams
} from '../../modules/overlays/models/base-overlay-source-provider.model';
import {
	DisplayOverlayAction,
	RequestOverlayByIDFromBackendAction
} from '../../modules/overlays/actions/overlays.actions';
import { OverlaySourceProvider } from '../../modules/overlays/models/overlays-source-providers';
import { OverlaysConfig, OverlaysService } from '../../modules/overlays/services/overlays.service';
import {
	fourViewsConfig,
	GeoRegisteration,
	IOverlay,
	IOverlaysFetchData,
	RegionContainment
} from '../../modules/overlays/models/overlay.model';
import { ICase } from '../../modules/menu-items/cases/models/case.model';
import { overlayStatusConfig } from '../../modules/overlays/overlay-status/config/overlay-status-config';
import { ScreenViewConfig } from '../../modules/plugins/openlayers/plugins/visualizers/models/screen-view.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MultipleOverlaysSourceProvider } from '../../modules/overlays/services/multiple-source-provider';
import { LoggerService } from '../../modules/core/services/logger.service';
import { MultipleOverlaysSourceConfig } from '../../modules/core/models/multiple-overlays-source-config';

@ImageryMapSource({
	sourceType: 'sourceType1',
	supported: [<any>'mapType1']
})
class SourceProviderMock1 extends BaseMapSourceProvider {
	readonly supported: IBaseImageryMapConstructor[] = [];

	create(metaData: any): Promise<any> {
		return Promise.resolve(true);
	}

	createAsync(metaData: IMapSettings): Promise<any> {
		return Promise.resolve();
	}

	startTimingLog = key => {
	};

	endTimingLog = key => {
	};

}

@OverlaySourceProvider({
	sourceType: 'Mock'
})
class OverlaySourceProviderMock extends BaseOverlaySourceProvider {
	public fetch(fetchParams: IFetchParams): Observable<IOverlaysFetchData> {
		return EMPTY;
	}

	public getById(id: string, sourceType: string = null): Observable<IOverlay> {
		return EMPTY;
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
	let layerState: ILayerState;
	let toolsState: IToolsState;
	let casesService: CasesService;
	let baseSourceProviders: BaseMapSourceProvider[];
	const imageryCommunicatorServiceMock = {
		provide: () => {
		},
		communicatorsAsArray: () => {
		}
	};
	let fakeOverlay: IOverlay;

	const imagery1PositionBoundingBox = { test: 1 };

	const cases: ICase[] = [{
		id: '1',
		name: 'name',
		creationTime: new Date(),
		autoSave: false,
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
					{ id: 'imagery2', data: { position: { zoom: 3, center: 4 }, overlayDisplayMode: 'Heatmap' } },
					{ id: 'imagery3', data: { position: { zoom: 5, center: 6 } } }
				],
				activeMapId: 'imagery1'
			}
		} as any
	}
	];

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				TranslateModule.forRoot(),
				HttpClientModule,
				StoreModule.forRoot({
					[casesFeatureKey]: CasesReducer,
					[statusBarFeatureKey]: StatusBarReducer,
					[overlaysFeatureKey]: OverlayReducer,
					[mapFeatureKey]: MapReducer
				})
			],
			providers: [
				{ provide: MultipleOverlaysSourceProvider, useClass: OverlaySourceProviderMock },
				{
					provide: OverlaysService,
					useValue: {
						getAllSensorsNames: () => {}
					}
				},
				{ provide: LoggerService, useValue: {} },
				TranslateService,
				{
					provide: CacheService,
					useClass: CacheService,
					deps: [VisualizersConfig, ImageryCommunicatorService]
				},
				ImageryCommunicatorService,
				{ provide: VisualizersConfig, useValue: {} },
				{ provide: fourViewsConfig, useValue: {} },
				{ provide: casesConfig, useValue: {} },
				{ provide: OverlaysConfig, useValue: {} },
				{ provide: MultipleOverlaysSourceConfig, useValue: {} },
				MapAppEffects,
				OverlaysService,
				{ provide: BaseMapSourceProvider, useClass: SourceProviderMock1, multi: true },
				{
					provide: overlayStatusConfig,
					useValue: {}
				}, {
					provide: mapFacadeConfig,
					useValue: {}
				}, {
					provide: ScreenViewConfig,
					useValue: {}
				},
				{ provide: IMAGERY_MAPS, useValue: {} },
				{
					provide: IMAGERY_CONFIG, useValue: {
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
						}
						],
						'maxCachedLayers': 100
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
						getOverlaysMarkup: () => null
					}
				},
				{
					provide: MAP_SOURCE_PROVIDERS_CONFIG,
					useValue: {}
				},
				{
					provide: GetProvidersMapsService,
					useValue: {}
				}
			]

		}).compileComponents();
	}));

	/* store data mock */
	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
		const selectedCase = cases[0];
		icaseState = { selectedCase } as any;

		statusBarState = cloneDeep(StatusBarInitialState);
		mapState = cloneDeep(initialMapState);
		overlaysState = cloneDeep(overlaysInitialState);
		layerState = cloneDeep(initialLayersState);

		toolsState = cloneDeep(toolsInitialState);
		fakeOverlay = <any>{ id: 'overlayId', date: new Date(), isGeoRegistered: GeoRegisteration.geoRegistered };
		overlaysState.entities[fakeOverlay.id] = fakeOverlay;
		mapState.entities = icaseState.selectedCase.state.maps.data.reduce((obj, map) => ({
			...obj,
			[map.id]: map
		}), {});
		mapState.activeMapId = icaseState.selectedCase.state.maps.activeMapId;


		const fakeStore = new Map<any, any>([
			[casesStateSelector, icaseState],
			[statusBarStateSelector, statusBarState],
			[overlaysStateSelector, overlaysState],
			[layersStateSelector, layerState],
			[mapStateSelector, mapState],
			[toolsStateSelector, toolsState],
			[selectMaps, mapState.entities]
		]);

		spyOn(store, 'select').and.callFake(type => of(fakeStore.get(type)));
	}));

	beforeEach(inject([MapAppEffects, ImageryCommunicatorService, CasesService, BaseMapSourceProvider], (_mapAppEffects: MapAppEffects, _imageryCommunicatorService: ImageryCommunicatorService, _casesService: CasesService, _baseSourceProviders: BaseMapSourceProvider[]) => {
		mapAppEffects = _mapAppEffects;

		imageryCommunicatorService = _imageryCommunicatorService;
		casesService = _casesService;
		baseSourceProviders = _baseSourceProviders;
	}));

	describe('onDisplayOverlay$ communicator should set Layer on map, by getFootprintIntersectionRatioInExtent', () => {
		const fakeLayer = {};
		const fakeExtent = [1, 2, 3, 4];
		let fakeCommunicator: CommunicatorEntity;

		beforeEach(() => {
			fakeCommunicator = <any>{
				ActiveMap: { MapType: 'ol' },
				resetView: () => {
				}
			};

			const fakeSourceLoader = {
				createAsync: () => {
					return {
						then: (callback) => callback(fakeLayer)
					};
				}
			};


			Object.defineProperty(extentFromGeojson, 'extentFromGeojson', {
				writable: true,
				configurable: true,
				value: () => {
				}
			});

			spyOnProperty(extentFromGeojson, 'bboxFromGeoJson', 'get').and.returnValue(<any>fakeExtent);

			spyOn(imageryCommunicatorService, 'provide').and.returnValue(fakeCommunicator);
			spyOn(baseSourceProviders, 'find').and.returnValue(<any>fakeSourceLoader);
			spyOn(fakeCommunicator, 'resetView');
		});

		it('should NOT dispatch/do anything if "overlay date = undefined"', () => {
			const testOverlay: IOverlay = <IOverlay>{
				id: 'testOverlayId',
				name: 'testOverlay1',
				photoTime: new Date().toDateString(),
				azimuth: 0,
				isGeoRegistered: GeoRegisteration.geoRegistered
			};
			actions = hot('--a--', { a: new DisplayOverlayAction({ overlay: testOverlay, mapId: 'imagery1' }) });
			const expectedResults = cold('-');
			expect(mapAppEffects.onDisplayOverlay$).toBeObservable(expectedResults);
		});
	});

	describe('onOverlayFromURL$ from IDAHO', () => {
		it('should dispatch RequestOverlayByIDFromBackendAction if "overlay date = undefined"', () => {
			const testOverlay: IOverlay = <IOverlay>{
				id: 'testOverlayId',
				name: 'testOverlay1',
				photoTime: new Date().toDateString(),
				azimuth: 0,
				isGeoRegistered: GeoRegisteration.geoRegistered,
				sourceType: 'IDAHO'
			};
			actions = hot('--a--', { a: new DisplayOverlayAction({ overlay: testOverlay, mapId: 'imagery1' }) });

			const expectedResults = cold('--(bc)--', {
				b: new RequestOverlayByIDFromBackendAction({
					overlayId: testOverlay.id,
					sourceType: 'IDAHO',
					mapId: 'imagery1'
				}),
				c: new SetIsLoadingAcion({ mapId: 'imagery1', show: true, text: 'Loading Overlay' })
			});

			expect(mapAppEffects.onOverlayFromURL$).toBeObservable(expectedResults);
		});


		it('should NOT dispatch anything if "overlay date exists"', () => {
			const testOverlay: IOverlay = {
				id: 'testOverlayId',
				name: 'testOverlay1',
				photoTime: new Date().toDateString(),
				date: new Date(),
				azimuth: 0,
				isGeoRegistered: GeoRegisteration.geoRegistered,
				containedInSearchPolygon: RegionContainment.unknown
			};
			icaseState.selectedCase.state.maps.data[0].data.overlay = testOverlay;
			actions = hot('--a--', { a: new DisplayOverlayAction({ overlay: testOverlay, mapId: 'imagery1' }) });
			const expectedResults = cold('-');
			expect(mapAppEffects.onOverlayFromURL$).toBeObservable(expectedResults);
		});
	});

	describe('onOverlayFromURL$ from PLANET', () => {
		it('should dispatch RequestOverlayByIDFromBackendAction if "overlay date = undefined"', () => {
			const testOverlay: IOverlay = <IOverlay>{
				id: 'testOverlayId',
				name: 'testOverlay1',
				photoTime: new Date().toDateString(),
				azimuth: 0,
				isGeoRegistered: GeoRegisteration.geoRegistered,
				sourceType: 'PLANET',
				containedInSearchPolygon: RegionContainment.unknown
			};
			actions = hot('--a--', { a: new DisplayOverlayAction({ overlay: testOverlay, mapId: 'imagery1' }) });

			const expectedResults = cold('--(bc)--', {
				b: new RequestOverlayByIDFromBackendAction({
					overlayId: testOverlay.id,
					sourceType: 'PLANET',
					mapId: 'imagery1'
				}),
				c: new SetIsLoadingAcion({ mapId: 'imagery1', show: true, text: 'Loading Overlay' })
			});

			expect(mapAppEffects.onOverlayFromURL$).toBeObservable(expectedResults);
		});
	});

	describe('displayOverlayOnNewMapInstance$', () => {
		it('displayOverlayOnNewMapInstance$ should dispatch DisplayOverlayAction when communicator added that contains overlay', () => {
			const overlay = {
				id: 'testOverlayId',
				name: 'testOverlay1',
				photoTime: new Date().toDateString(),
				date: new Date(),
				azimuth: 0,
				isGeoRegistered: GeoRegisteration.geoRegistered,
				containedInSearchPolygon: RegionContainment.unknown
			};
			icaseState.selectedCase.state.maps.data[0].data.overlay = overlay;

			const communicators: Array<string> = ['imagery1'];
			actions = hot('--a--', {
				a: new ImageryCreatedAction({ id: 'imagery1' })
			});
			const expectedResults = cold('--b--', {
				b: new DisplayOverlayAction({
					overlay,
					mapId: 'imagery1',
					forceFirstDisplay: true
				})
			});
			expect(mapAppEffects.displayOverlayOnNewMapInstance$).toBeObservable(expectedResults);
		});

		it('should not dispatch DisplayOverlayAction when communicator added that doesnt contain overlay', () => {
			icaseState.selectedCase.state.maps.data[1].data.overlay = null;
			const communicators: Array<string> = ['imagery2'];
			actions = hot('--a--', {
				a: new ImageryCreatedAction({ id: 'imagery2' })
			});
			const expectedResults = cold('-');
			expect(mapAppEffects.displayOverlayOnNewMapInstance$).toBeObservable(expectedResults);
		});
	});

});
