import { inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { OverlaysAppEffects } from './overlays.app.effects';
import {
	DisplayMultipleOverlaysFromStoreAction,
	DisplayOverlayAction,
	DisplayOverlayFromStoreAction,
	DisplayOverlaySuccessAction,
	MarkUpClass,
	OverlayReducer,
	overlaysFeatureKey,
	overlaysInitialState,
	OverlaysService,
	overlaysStateSelector,
	selectDropMarkup,
	selectOverlaysMap,
	SetFilteredOverlaysAction,
	SetHoveredOverlayAction
} from '@ansyn/overlays';
import { Observable, of } from 'rxjs';
import {
	casesFeatureKey,
	CasesReducer,
	CasesService,
	casesStateSelector,
	initialCasesState,
	IToolsState,
	toolsFeatureKey,
	toolsInitialState,
	ToolsReducer,
	toolsStateSelector
} from '@ansyn/menu-items';
import { HttpClientModule } from '@angular/common/http';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { statusBarStateSelector } from '@ansyn/status-bar';

import {
	coreInitialState,
	coreStateSelector,
	DisplayedOverlay,
	ICase,
	MAP_SOURCE_PROVIDERS_CONFIG,
	SetLayoutAction,
	SetLayoutSuccessAction
} from '@ansyn/core';
import { BaseMapSourceProvider, CacheService, ImageryCommunicatorService, ImageryMapSource } from '@ansyn/imagery';
import {
	initialMapState,
	mapFeatureKey,
	MapReducer,
	mapStateSelector,
	RemovePendingOverlayAction,
	selectMapsList,
	SetPendingOverlaysAction
} from '@ansyn/map-facade';
import {
	contextFeatureSelector,
	contextInitialState,
	selectContextsParams,
	SetContextParamsAction
} from '@ansyn/context';
import { cloneDeep as _cloneDeep } from 'lodash';

describe('OverlaysAppEffects', () => {
	let overlaysAppEffects: OverlaysAppEffects;
	let actions: Observable<any>;
	let store: Store<any>;
	let casesService: CasesService;
	let overlaysService: OverlaysService;
	let imageryCommunicatorService: ImageryCommunicatorService;

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
					{ id: 'imagery1', data: { overlayDisplayMode: 'Heatmap' } },
					{ id: 'imagery2', data: { overlayDisplayMode: 'None' } },
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

	const coreState = { ...coreInitialState };

	const casesState = { ...initialCasesState, cases: [caseItem], selectedCase: caseItem };

	const mapState = { ...initialMapState, entities: { '1': { 'id': '1' }, '2': { 'id': '2' } }, ids: ['1', '2'] };

	const statusBarState: any = { 'layouts': [{ 'mapsCount': 3 }] };

	const contextState: any = { ...contextInitialState };

	@ImageryMapSource({
		supported: [],
		sourceType: 'FIRST'
	})
	class MapSourceProviderMock extends BaseMapSourceProvider {
		public create(metaData: any): any[] {
			return [];
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
						getStartDateViaLimitFasets: () => {
							return of({
								'startDate': new Date('2014-06-27T08:43:03.624Z'),
								'endDate': new Date('2015-06-27T08:43:03.624Z')
							});
						},
						getStartAndEndDateViaRangeFacets: () => {
							return of({
								'startDate': new Date('2014-06-27T08:43:03.624Z'),
								'endDate': new Date('2015-06-27T08:43:03.624Z')
							});
						},
						getTimeStateByOverlay: () => {
						},
						getAllOverlays$: of(new Map<string, any>(Object.entries(exampleOverlays)))
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
			[coreStateSelector, coreState],
			[selectDropMarkup, overlaysState.dropsMarkUp],
			[selectOverlaysMap, new Map(Object.entries(exampleOverlays))],
			[contextFeatureSelector, contextState],
			[selectContextsParams, contextState.params],
			[selectMapsList, Object.values(mapState.entities)]
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


	it('displayLatestOverlay$ effect should have been call only if displayOverlay = "latest"', () => {
		contextState.params.defaultOverlay = DisplayedOverlay.latest;
		actions = hot('--a--', { a: new SetFilteredOverlaysAction([]) });
		const expectedResults = cold('--(ab)--', {
			a: new SetContextParamsAction({ defaultOverlay: null }),
			b: new DisplayOverlayFromStoreAction({ id: 'last' })
		});
		expect(overlaysAppEffects.displayLatestOverlay$).toBeObservable(expectedResults);
	});

	it(`displayTwoNearestOverlay$ effect with one overlay before and one date after 
	should call DisplayMultipleOverlaysFromStoreAction with those two overlays`, () => {
		contextState.params.defaultOverlay = DisplayedOverlay.nearest;
		contextState.params.time = new Date('2015-06-27T08:43:03.624Z');

		actions = hot('--a--', { a: new SetFilteredOverlaysAction([]) });
		const expectedResults = cold('--(bc)--', {
			b: new DisplayMultipleOverlaysFromStoreAction([{
				overlay: firstOverlay,
				extent: undefined
			}, { overlay: secondOverlay, extent: undefined }]),
			c: new SetContextParamsAction({ defaultOverlay: null })
		});
		expect(overlaysAppEffects.displayTwoNearestOverlay$).toBeObservable(expectedResults);
	});

	it(`displayTwoNearestOverlay$ effect with overlay before
	should call DisplayMultipleOverlaysFromStoreAction one undefined`, () => {
		const overlay: any = { id: 'first', 'photoTime': new Date('2014-06-27T08:43:03.624Z') };
		overlaysState.entities = { [overlay.id]: overlay };
		overlaysState.filteredOverlays = ['first'];

		contextState.params.defaultOverlay = DisplayedOverlay.nearest;
		contextState.params.time = new Date('2015-06-27T08:43:03.624Z');

		actions = hot('--a--', { a: new SetFilteredOverlaysAction([]) });
		const expectedResults = cold('--(bc)--', {
			b: new DisplayMultipleOverlaysFromStoreAction([<any>{ overlay, extent: undefined }]),
			c: new SetContextParamsAction({ defaultOverlay: null })
		});
		expect(overlaysAppEffects.displayTwoNearestOverlay$).toBeObservable(expectedResults);
	});

	it(`displayTwoNearestOverlay$ effect with overlay after
	should call DisplayMultipleOverlaysFromStoreAction one undefined`, () => {
		const overlay: any = { id: 'last', 'photoTime': new Date('2016-06-27T08:43:03.624Z') };
		overlaysState.entities = { [overlay.id]: overlay };
		overlaysState.filteredOverlays = ['last'];

		contextState.params.defaultOverlay = DisplayedOverlay.nearest;
		contextState.params.time = new Date('2015-06-27T08:43:03.624Z');

		actions = hot('--a--', { a: new SetFilteredOverlaysAction([]) });
		const expectedResults = cold('--(bc)--', {
			b: new DisplayMultipleOverlaysFromStoreAction([<any>{ overlay, extent: undefined }]),
			c: new SetContextParamsAction({ defaultOverlay: null })
		});
		expect(overlaysAppEffects.displayTwoNearestOverlay$).toBeObservable(expectedResults);
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
			c: new DisplayOverlayAction({ overlay: <any>ov2, 'mapId': '2', extent: undefined })
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
					mapId: '4444'
				})
			});
			const expectedResults = cold('--b--', {
				b: new DisplayOverlayAction({ overlay: <any>firstOverlay, mapId: '4444', extent: undefined })
			});
			expect(overlaysAppEffects.onDisplayOverlayFromStore$).toBeObservable(expectedResults);
		});

		it('No MapId on payload( should dispatch activeMapId as mapId )', () => {
			const lastOverlayId: string = exampleOverlays.last.id;
			const lastOverlay = exampleOverlays.last;
			mapState.activeMapId = 'activeMapId';

			actions = hot('--a--', {
				a: new DisplayOverlayFromStoreAction({
					id: lastOverlayId
				})
			});

			const expectedResults = cold('--b--', {
				b: new DisplayOverlayAction({ overlay: <any>lastOverlay, mapId: 'activeMapId', extent: undefined })
			});
			expect(overlaysAppEffects.onDisplayOverlayFromStore$).toBeObservable(expectedResults);
		});

	});

	describe('setHoveredOverlay$ effect', () => {
		it('should get hovered overlay by tracking overlays.dropsMarkUp, return an action to set overlays.hoveredOverlay', () => {
			const expectedResults = cold('(b|)', {
				b: new SetHoveredOverlayAction(overlaysState.entities['first'])
			});
			expect(overlaysAppEffects.setHoveredOverlay$).toBeObservable(expectedResults);
		});
	});

})
;
