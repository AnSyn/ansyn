import { inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { OverlaysAppEffects } from './overlays.app.effects';
import {
	DisplayMultipleOverlaysFromStoreAction,
	DisplayOverlayAction,
	DisplayOverlayFromStoreAction,
	DisplayOverlaySuccessAction,
	SetFilteredOverlaysAction,
	SetHoveredOverlayAction
} from '@ansyn/overlays/actions/overlays.actions';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { BaseOverlaySourceProvider } from '@ansyn/overlays/models/base-overlay-source-provider.model';
import { OverlaySourceProviderMock } from '@ansyn/overlays/services/overlays.service.spec';
import {
	MarkUpClass,
	OverlayReducer,
	overlaysFeatureKey,
	overlaysInitialState,
	overlaysStateSelector,
	selectDropMarkup,
	selectOverlaysMap
} from '@ansyn/overlays/reducers/overlays.reducer';
import { Observable } from 'rxjs/Observable';
import {
	IToolsState,
	toolsFeatureKey,
	toolsInitialState,
	ToolsReducer,
	toolsStateSelector
} from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { HttpClientModule } from '@angular/common/http';
import { provideMockActions } from '@ngrx/effects/testing';
import {
	casesFeatureKey,
	CasesReducer,
	casesStateSelector,
	initialCasesState
} from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { cold, hot } from 'jasmine-marbles';
import { statusBarStateSelector } from '@ansyn/status-bar/reducers/status-bar.reducer';

import { coreInitialState, coreStateSelector } from '@ansyn/core/reducers/core.reducer';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { Case } from '@ansyn/core/models/case.model';
import { initialMapState, mapFeatureKey, MapReducer, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import {
	RemovePendingOverlayAction,
	SetPendingOverlaysAction,
	SynchronizeMapsAction
} from '@ansyn/map-facade/actions/map.actions';
import { SetLayoutAction, SetLayoutSuccessAction } from '@ansyn/core/actions/core.actions';

describe('OverlaysAppEffects', () => {
	let overlaysAppEffects: OverlaysAppEffects;
	let actions: Observable<any>;
	let store: Store<any>;
	let casesService: CasesService;
	let overlaysService: OverlaysService;
	let imageryCommunicatorService: ImageryCommunicatorService;

	let imageryCommunicatorServiceMock = {
		provide: () => {
		}
	};
	const caseItem: Case = {
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
	const exampleOverlays: any = [
		['first', { id: 'first', 'photoTime': new Date('2014-06-27T08:43:03.624Z') }],
		['last', { id: 'last', 'photoTime': new Date() }]
	];

	const toolsState: IToolsState = { ...toolsInitialState };
	const overlaysState = {
		...overlaysInitialState,
		filteredOverlays: ['first', 'last'],
		overlays: new Map<string, any>(exampleOverlays)
	};

	const initOverlaysState = () => {
		overlaysState.filteredOverlays = ['first', 'last'];
		overlaysState.overlays = new Map<string, any>(exampleOverlays);
	};

	const coreState = { ...coreInitialState };
	const casesState = { ...initialCasesState, cases: [caseItem], selectedCase: caseItem };
	const mapState = { ...initialMapState, mapsList: [{ 'id': '1' }, { 'id': '2' }] };

	const statusBarState: any = { 'layouts': [{ 'mapsCount': 3 }] };

	overlaysState.dropsMarkUp.set(MarkUpClass.hover, { overlaysIds: ['first'] });

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
				provideMockActions(() => actions),
				{ provide: BaseOverlaySourceProvider, useClass: OverlaySourceProviderMock },
				{
					provide: CasesService,
					useValue: {
						getOverlaysMarkup: () => null,
						'contextValues': {
							'imageryCountBefore': -1,
							'imageryCountAfter': -1,
							'defaultOverlay': '',
							'time': new Date()
						}
					}
				},
				{
					provide: OverlaysService,
					useValue: {
						getStartDateViaLimitFasets: () => {
							return Observable.of({
								'startDate': new Date('2014-06-27T08:43:03.624Z'),
								'endDate': new Date('2015-06-27T08:43:03.624Z')
							});
						},
						getStartAndEndDateViaRangeFacets: () => {
							return Observable.of({
								'startDate': new Date('2014-06-27T08:43:03.624Z'),
								'endDate': new Date('2015-06-27T08:43:03.624Z')
							});
						},
						getTimeStateByOverlay: () => {
						}
					}
				},
				{
					provide: ImageryCommunicatorService,
					useValue: imageryCommunicatorServiceMock
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
			[selectOverlaysMap, overlaysState.overlays]
		]);

		spyOn(store, 'select').and.callFake(type => Observable.of(fakeStore.get(type)));

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
		casesService.contextValues.defaultOverlay = 'latest';
		actions = hot('--a--', { a: new SetFilteredOverlaysAction([]) });
		const expectedResults = cold('--b--', {
			b: new DisplayOverlayFromStoreAction({
				id: 'last'
			})
		});
		expect(overlaysAppEffects.displayLatestOverlay$).toBeObservable(expectedResults);
	});

	it(`displayTwoNearestOverlay$ effect with one overlay before and one date after 
	should call DisplayMultipleOverlaysFromStoreAction with those two overlays`, () => {
		casesService.contextValues.defaultOverlay = 'nearest';
		casesService.contextValues.time = new Date('2015-06-27T08:43:03.624Z');

		actions = hot('--a--', { a: new SetFilteredOverlaysAction([]) });
		const expectedResults = cold('--b--', {
			b: new DisplayMultipleOverlaysFromStoreAction(['first', 'last'])
		});
		expect(overlaysAppEffects.displayTwoNearestOverlay$).toBeObservable(expectedResults);
	});

	it(`displayTwoNearestOverlay$ effect with overlay before
	should call DisplayMultipleOverlaysFromStoreAction one undefined`, () => {
		overlaysState.overlays = new Map<string, any>([['first', { 'photoTime': new Date('2014-06-27T08:43:03.624Z') }]]);
		overlaysState.filteredOverlays = ['first'];

		casesService.contextValues.defaultOverlay = 'nearest';
		casesService.contextValues.time = new Date('2015-06-27T08:43:03.624Z');

		actions = hot('--a--', { a: new SetFilteredOverlaysAction([]) });
		const expectedResults = cold('--b--', {
			b: new DisplayMultipleOverlaysFromStoreAction(['first'])
		});
		expect(overlaysAppEffects.displayTwoNearestOverlay$).toBeObservable(expectedResults);
	});

	it(`displayTwoNearestOverlay$ effect with overlay after
	should call DisplayMultipleOverlaysFromStoreAction one undefined`, () => {
		overlaysState.overlays = new Map<string, any>([['last', { 'photoTime': new Date('2016-06-27T08:43:03.624Z') }]]);
		overlaysState.filteredOverlays = ['last'];

		casesService.contextValues.defaultOverlay = 'nearest';
		casesService.contextValues.time = new Date('2015-06-27T08:43:03.624Z');

		actions = hot('--a--', { a: new SetFilteredOverlaysAction([]) });
		const expectedResults = cold('--b--', {
			b: new DisplayMultipleOverlaysFromStoreAction(['last'])
		});
		expect(overlaysAppEffects.displayTwoNearestOverlay$).toBeObservable(expectedResults);
	});

	it(`displayMultipleOverlays$ effect with overlays count smaller than map count
	should call DisplayOverlayFromStoreAction`, () => {
		actions = hot('--a--', { a: new DisplayMultipleOverlaysFromStoreAction(['first', 'last']) });
		const expectedResults = cold('--(bcd)--', {
			b: new DisplayOverlayFromStoreAction({ 'id': 'first', 'mapId': '1' }),
			c: new DisplayOverlayFromStoreAction({ 'id': 'last', 'mapId': '2' }),
			d: new SynchronizeMapsAction({ mapId: '1' })
		});
		expect(overlaysAppEffects.displayMultipleOverlays$).toBeObservable(expectedResults);
	});

	it(`displayMultipleOverlays$ effect with overlays count larger than map count
	should call SetPendingOverlaysAction and ChangeLayoutAction`, () => {
		actions = hot('--a--', { a: new DisplayMultipleOverlaysFromStoreAction(['one', 'two', 'three']) });
		const expectedResults = cold('--(bc)--', {
			b: new SetPendingOverlaysAction(['one', 'two', 'three']),
			c: new SetLayoutAction('layout4')
		});
		expect(overlaysAppEffects.displayMultipleOverlays$).toBeObservable(expectedResults);
	});

	it(`displayPendingOverlaysOnChangeLayoutSuccess$ effect with overlays
	should call DisplayOverlayFromStoreAction`, () => {
		mapState['pendingOverlays'] = ['first', 'last'];
		actions = hot('--a--', { a: new SetLayoutSuccessAction() });
		const expectedResults = cold('--(bcd)--', {
			b: new DisplayOverlayFromStoreAction({ 'id': 'first', 'mapId': '1' }),
			c: new DisplayOverlayFromStoreAction({ 'id': 'last', 'mapId': '2' }),
			d: new SynchronizeMapsAction({ mapId: '1' })
		});
		expect(overlaysAppEffects.displayPendingOverlaysOnChangeLayoutSuccess$).toBeObservable(expectedResults);
	});

	it(`removePendingOverlayOnDisplay$ effect with overlay
	should call RemovePendingOverlayAction with that overlay`, () => {
		mapState['pendingOverlays'] = ['first', 'last'];
		actions = hot('--a--', {
			a: new DisplayOverlaySuccessAction({
				overlay: <any> { id: 'first' },
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
			const firstOverlayId: string = exampleOverlays[0][0];
			const firstOverlay = exampleOverlays[0][1];
			actions = hot('--a--', {
				a: new DisplayOverlayFromStoreAction({
					id: firstOverlayId,
					mapId: '4444'
				})
			});
			const expectedResults = cold('--b--', {
				b: new DisplayOverlayAction({
					overlay: <any> firstOverlay,
					mapId: '4444'
				})
			});
			expect(overlaysAppEffects.onDisplayOverlayFromStore$).toBeObservable(expectedResults);
		});

		it('No MapId on payload( should dispatch activeMapId as mapId )', () => {
			const lastOverlayId: string = exampleOverlays[1][0];
			const lastOverlay = exampleOverlays[1][1];
			mapState.activeMapId = 'activeMapId';

			actions = hot('--a--', {
				a: new DisplayOverlayFromStoreAction({
					id: lastOverlayId
				})
			});
			const expectedResults = cold('--b--', {
				b: new DisplayOverlayAction({
					overlay: <any> lastOverlay,
					mapId: 'activeMapId'
				})
			});
			expect(overlaysAppEffects.onDisplayOverlayFromStore$).toBeObservable(expectedResults);
		});

	});

	describe('setHoveredOverlay$ effect', () => {
		it ('should get hovered overlay by tracking overlays.dropsMarkUp, return an action to set overlays.hoveredOverlay', () => {
			const expectedResults = cold('(b|)', { b: new SetHoveredOverlayAction(overlaysState.overlays.get('first')) });
			expect(overlaysAppEffects.setHoveredOverlay$).toBeObservable(expectedResults);
		});
	});

});
