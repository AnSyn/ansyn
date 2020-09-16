import { inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { OverlaysAppEffects } from './overlays.app.effects';
import { Observable, of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { statusBarStateSelector } from '../../modules/status-bar/reducers/status-bar.reducer';
import {
	BaseMapSourceProvider,
	CacheService,
	ImageryCommunicatorService,
	ImageryMapSource,
	IMapSettings,
	MAP_SOURCE_PROVIDERS_CONFIG
} from '@ansyn/imagery';
import {
	IMapState,
	initialMapState,
	mapFeatureKey,
	MapReducer,
	mapStateSelector,
	RemovePendingOverlayAction,
	selectActiveMapId,
	selectMaps,
	selectMapsList,
	SetLayoutAction,
	SetLayoutSuccessAction,
	SetPendingOverlaysAction
} from '@ansyn/map-facade';

import { cloneDeep as _cloneDeep } from 'lodash';
import {
	casesFeatureKey,
	CasesReducer,
	casesStateSelector,
	initialCasesState
} from '../../modules/menu-items/cases/reducers/cases.reducer';
import { CasesService } from '../../modules/menu-items/cases/services/cases.service';
import {
	IToolsState,
	toolsFeatureKey,
	toolsInitialState,
	ToolsReducer,
	toolsStateSelector
} from '../../modules/menu-items/tools/reducers/tools.reducer';
import {
	DisplayMultipleOverlaysFromStoreAction,
	DisplayOverlayAction,
	DisplayOverlayFromStoreAction,
	DisplayOverlaySuccessAction,
	SetHoveredOverlayAction
} from '../../modules/overlays/actions/overlays.actions';
import {
	MarkUpClass,
	OverlayReducer,
	overlaysFeatureKey,
	overlaysInitialState,
	overlaysStateSelector,
	selectDropMarkup,
	selectOverlaysMap
} from '../../modules/overlays/reducers/overlays.reducer';
import { OverlaysService } from '../../modules/overlays/services/overlays.service';
import { ICase } from '../../modules/menu-items/cases/models/case.model';
import { cloneDeep } from 'lodash';

describe('OverlaysAppEffects', () => {
	let overlaysAppEffects: OverlaysAppEffects;
	let actions: Observable<any>;
	let store: Store<any>;
	let casesService: CasesService;
	let overlaysService: OverlaysService;
	let imageryCommunicatorService: ImageryCommunicatorService;
	let mapState: IMapState = cloneDeep(initialMapState);

	let imageryCommunicatorServiceMock = {
		provide: () => ({
			getPosition: () => of({}),
			getMapSourceProvider: () => ({
				getThumbnailUrl: () => of('this is a url')
			})
		})
	};
	const caseItem: ICase = {
		'id': '31b33526-6447-495f-8b52-83be3f6b55bd',
		'state': {
			'region': {
				'type': 'FeatureCollection',
				'features': [{
					'type': 'Feature',
					'properties': {
						'MUN_HEB': 'Hasharon',
						'MUN_ENG': 'Hasharon'
					},
					'geometry': {
						'type': 'Polygon',
						'coordinates': [
							[
								[35.71991824722275, 32.709192409794866],
								[35.54566531753454, 32.393992011030576]
							]


						]
					}
				}
				]
			},
			'time': {
				'type': 'absolute',
				'from': new Date('2013-06-27T08:43:03.624Z'),
				'to': new Date('2015-04-17T03:55:12.129Z')
			},
			maps: {
				data: [
					{ id: 'imagery1', data: { position: true, overlayDisplayMode: 'Heatmap' } },
					{ id: 'imagery2', data: { position: true, overlayDisplayMode: 'None' } },
					{ id: 'imagery3', data: {} }
				],
				activeMapId: 'imagery1'
			}
		}
	} as any;

	const firstOverlay = <any>{
		id: 'first',
		'photoTime': new Date('2014-06-27T08:43:03.624Z'),
		'sourceType': 'FIRST',
		'thumbnailUrl': 'http://first'
	};
	const secondOverlay = <any>{
		id: 'last',
		'photoTime': new Date(),
		'sourceType': 'LAST',
		'thumbnailUrl': 'http://last'
	};

	const exampleOverlays: any = {
		'first': firstOverlay,
		'last': secondOverlay
	};

	const toolsState: IToolsState = { ...toolsInitialState };

	const overlaysState = _cloneDeep(overlaysInitialState);

	const initOverlaysState = () => {
		overlaysState.filteredOverlays = ['first', 'last'];
		overlaysState.ids = [firstOverlay.id, secondOverlay.id];
		overlaysState.entities = { ...exampleOverlays };
		overlaysState.dropsMarkUp.set(MarkUpClass.hover, { overlaysIds: ['first'] });
	};

	const casesState = { ...initialCasesState, cases: [caseItem], selectedCase: caseItem };

	const fakeMap: IMapSettings = <any>{ id: '1', data: { position: true } };
	const fakeMap2: IMapSettings = <any>{ id: '2', data: { position: true } };
	mapState.ids = ['1', '2'];
	mapState.entities = { [fakeMap.id]: fakeMap, [fakeMap2.id]: fakeMap2 };

	const statusBarState: any = { 'layouts': [{ 'mapsCount': 3 }] };

	@ImageryMapSource({
		supported: [],
		sourceType: 'FIRST'
	})
	class MapSourceProviderMock extends BaseMapSourceProvider {
		public create(metaData: any): Promise<any> {
			return Promise.resolve(null);
		}
	}

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				StoreModule.forRoot({
					[casesFeatureKey]: CasesReducer,
					[overlaysFeatureKey]: OverlayReducer,
					[toolsFeatureKey]: ToolsReducer,
					[mapFeatureKey]: MapReducer
				})
			],
			providers: [
				OverlaysAppEffects,
				{
					provide: MAP_SOURCE_PROVIDERS_CONFIG,
					useValue: {}
				},
				provideMockActions(() => actions),
				// { provide: BaseOverlaySourceProvider, useClass: OverlaySourceProviderMock },
				{
					provide: CasesService,
					useValue: {
						getOverlaysMarkup: () => null
					}
				},
				{
					provide: OverlaysService,
					useValue: {
						getTimeStateByOverlay: () => {
						},
						getAllOverlays$: of(new Map<string, any>(Object.entries(exampleOverlays))),
						getThumbnailUrl: () => of('this is a url')
					}
				},
				{
					provide: ImageryCommunicatorService,
					useValue: imageryCommunicatorServiceMock
				},
				{
					provide: BaseMapSourceProvider,
					useClass: MapSourceProviderMock,
					multi: true
				},
				{
					provide: CacheService,
					useClass: () => {
					}
				}
			]

		}).compileComponents();
	});

	beforeEach(inject([Store], (_store) => {
		store = _store;
		initOverlaysState();

		const fakeStore = new Map<any, any>([
			[casesStateSelector, casesState],
			[overlaysStateSelector, overlaysState],
			[toolsStateSelector, toolsState],
			[mapStateSelector, mapState],
			[statusBarStateSelector, statusBarState],
			[selectDropMarkup, overlaysState.dropsMarkUp],
			[selectOverlaysMap, new Map(Object.entries(exampleOverlays))],
			[selectMapsList, Object.values(mapState.entities)],
			[selectMaps, mapState.entities],
			[selectActiveMapId, '1']
		]);

		spyOn(store, 'select').and.callFake(type => of(fakeStore.get(type)));

	}));

	beforeEach(inject([CasesService, ImageryCommunicatorService, OverlaysAppEffects, OverlaysService], (_casesService: CasesService, _imageryCommunicatorService: ImageryCommunicatorService, _overlaysAppEffects: OverlaysAppEffects, _overlaysService: OverlaysService) => {
		casesService = _casesService;
		overlaysAppEffects = _overlaysAppEffects;
		overlaysService = _overlaysService;
		imageryCommunicatorService = _imageryCommunicatorService;
	}));

	it('should be defined', () => {
		expect(overlaysAppEffects).toBeTruthy();
	});

	it(`displayMultipleOverlays$ effect with overlays count smaller than map count
	should call DisplayOverlayFromStoreAction`, () => {
		actions = hot('--a--', { a: new DisplayMultipleOverlaysFromStoreAction([{ overlay: firstOverlay }, { overlay: secondOverlay }]) });
		const expectedResults = cold('--(bc)--', {
			b: new DisplayOverlayAction({ overlay: firstOverlay, 'mapId': '1', extent: undefined }),
			c: new DisplayOverlayAction({ overlay: secondOverlay, 'mapId': '2', extent: undefined })
		});
		expect(overlaysAppEffects.displayMultipleOverlays$).toBeObservable(expectedResults);
	});

	it(`displayMultipleOverlays$ effect with overlays count larger than map count
	should call SetPendingOverlaysAction and ChangeLayoutAction`, () => {
		const ov1 = <any>{ overlay: { id: 'one' }, extent: undefined },
			ov2 = <any>{ overlay: { id: 'two' }, extent: undefined },
			ov3 = <any>{ overlay: { id: 'three' }, extent: undefined };
		const payload = [ov1, ov2, ov3];
		actions = hot('--a--', { a: new DisplayMultipleOverlaysFromStoreAction(payload) });
		const expectedResults = cold('--(bc)--', {
			b: new SetPendingOverlaysAction(payload),
			c: new SetLayoutAction('layout4')
		});
		expect(overlaysAppEffects.displayMultipleOverlays$).toBeObservable(expectedResults);
	});

	it(`displayPendingOverlaysOnChangeLayoutSuccess$ effect with overlays
	should call DisplayOverlayFromStoreAction`, () => {
		const ov1 = <any>{ id: 'first' }, ov2 = <any>{ id: 'first' };
		mapState['pendingOverlays'] = [{ overlay: ov1 }, { overlay: ov2 }];
		actions = hot('--a--', { a: new SetLayoutSuccessAction() });
		const expectedResults = cold('--(bc)--', {
			b: new DisplayOverlayAction({ overlay: <any>ov1, 'mapId': '1', extent: undefined }),
			c: new DisplayOverlayAction({ overlay: <any>ov2, 'mapId': '2', extent: undefined})
		});
		expect(overlaysAppEffects.displayPendingOverlaysOnChangeLayoutSuccess$).toBeObservable(expectedResults);
	});

	it(`removePendingOverlayOnDisplay$ effect with overlay
	should call RemovePendingOverlayAction with that overlay`, () => {
		const ov1 = <any>{ id: 'first' }, ov2 = <any>{ id: 'first' };
		mapState['pendingOverlays'] = [{ overlay: ov1 }, { overlay: ov2 }];
		actions = hot('--a--', {
			a: new DisplayOverlaySuccessAction({
				overlay: <any>ov1,
				mapId: mapState.activeMapId
			})
		});
		const expectedResults = cold('--b--', {
			b: new RemovePendingOverlayAction('first')
		});
		expect(overlaysAppEffects.removePendingOverlayOnDisplay$).toBeObservable(expectedResults);
	});


	describe('onDisplayOverlayFromStore$ should get id and call DisplayOverlayAction with overlay from store', () => {
		it('MapId on payload', () => {
			const firstOverlayId: string = exampleOverlays.first.id;
			const firstOverlay = exampleOverlays.first;
			actions = hot('--a--', {
				a: new DisplayOverlayFromStoreAction({
					id: firstOverlayId,
					mapId: '4444',
					customOriantation: null
				})
			});
			const expectedResults = cold('--b--', {
				b: new DisplayOverlayAction({ overlay: <any>firstOverlay, mapId: '4444', extent: undefined, customOriantation: null })
			});
			expect(overlaysAppEffects.onDisplayOverlayFromStore$).toBeObservable(expectedResults);
		});

		it('No MapId on payload( should dispatch activeMapId as mapId )', () => {
			const lastOverlayId: string = exampleOverlays.last.id;
			const lastOverlay = exampleOverlays.last;
			mapState.activeMapId = 'activeMapId';

			actions = hot('--a--', {
				a: new DisplayOverlayFromStoreAction({
					id: lastOverlayId,
					customOriantation: null
				})
			});

			const expectedResults = cold('--b--', {
				b: new DisplayOverlayAction({ overlay: <any>lastOverlay, mapId: 'activeMapId', extent: undefined, customOriantation: null })
			});
			expect(overlaysAppEffects.onDisplayOverlayFromStore$).toBeObservable(expectedResults);
		});

	});

	describe('setHoveredOverlay$ effect', () => {
		mapState.activeMapId = fakeMap.id;
		mapState.entities = { [fakeMap.id]: fakeMap, [fakeMap2.id]: fakeMap2 };

		it('should get hovered overlay by tracking overlays.dropsMarkUp, return an action to set overlays.hoveredOverlay', () => {
			const expectedResults = cold('(b|)', {
				b: new SetHoveredOverlayAction(overlaysState.entities['first'])
			});
			expect(overlaysAppEffects.setHoveredOverlay$).toBeObservable(expectedResults);
		});
	});
});
