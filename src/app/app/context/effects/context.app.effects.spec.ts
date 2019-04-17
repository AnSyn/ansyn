import { inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';

import {
	DisplayMultipleOverlaysFromStoreAction,
	DisplayOverlayFromStoreAction, ICase,
	MarkUpClass,
	OverlayReducer,
	overlaysFeatureKey,
	overlaysInitialState,
	OverlaysService,
	overlaysStateSelector,
	selectDropMarkup,
	selectOverlaysMap,
	SetFilteredOverlaysAction
} from '@ansyn/ansyn';
import { Observable, of, throwError } from 'rxjs';
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
} from '@ansyn/ansyn';
import { HttpClientModule } from '@angular/common/http';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { statusBarStateSelector } from '@ansyn/ansyn';
import {
	DisplayedOverlay, ErrorHandlerService,
	StorageService
} from '@ansyn/ansyn';
import {
	MAP_SOURCE_PROVIDERS_CONFIG,
} from '@ansyn/imagery';
import { BaseMapSourceProvider, CacheService, ImageryCommunicatorService, ImageryMapSource } from '@ansyn/imagery';
import { initialMapState, mapFeatureKey, MapReducer, mapStateSelector, selectMapsList } from '@ansyn/map-facade';
import { cloneDeep as _cloneDeep } from 'lodash';
import { ContextAppEffects } from './context.app.effects';
import { SetContextParamsAction } from '../actions/context.actions';
import { contextFeatureSelector, contextInitialState, selectContextsParams } from '../reducers/context.reducer';
import { ContextConfig } from '../models/context.config';

describe('ContextAppEffects', () => {
	let contextAppEffects: ContextAppEffects;
	let actions: Observable<any>;
	let store: Store<any>;
	let casesService: CasesService;
	let overlaysService: OverlaysService;
	let imageryCommunicatorService: ImageryCommunicatorService;
	const contextState: any = { ...contextInitialState };

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

	const casesState = { ...initialCasesState, cases: [caseItem], selectedCase: caseItem };

	const mapState = { ...initialMapState, entities: { '1': { 'id': '1' }, '2': { 'id': '2' } }, ids: ['1', '2'] };

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
				ContextAppEffects,
				{
					provide: ErrorHandlerService,
					useValue: { httpErrorHandle: () => throwError(null) }
				},
				{
					provide: MAP_SOURCE_PROVIDERS_CONFIG,
					useValue: {}
				},
				provideMockActions(() => actions),
				{ provide: StorageService, useValue: {}},
				// { provide: BaseOverlaySourceProvider, useClass: OverlaySourceProviderMock },
				{
					provide: CasesService,
					useValue: {
						getOverlaysMarkup: () => null
					}
				},
				{
					provide: ContextConfig,
					useValue: {}
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
			[selectDropMarkup, overlaysState.dropsMarkUp],
			[selectOverlaysMap, new Map(Object.entries(exampleOverlays))],
			[contextFeatureSelector, contextState],
			[selectContextsParams, contextState.params],
			[selectMapsList, Object.values(mapState.entities)]
		]);

		spyOn(store, 'select').and.callFake(type => of(fakeStore.get(type)));

	}));

	beforeEach(inject([CasesService, ImageryCommunicatorService, ContextAppEffects, OverlaysService], (_casesService: CasesService, _imageryCommunicatorService: ImageryCommunicatorService, _contextAppEffects: ContextAppEffects, _overlaysService: OverlaysService) => {
		casesService = _casesService;
		contextAppEffects = _contextAppEffects;
		overlaysService = _overlaysService;
		imageryCommunicatorService = _imageryCommunicatorService;
	}));

	it('should be defined', () => {
		expect(contextAppEffects).toBeTruthy();
	});


	it('displayLatestOverlay$ effect should have been call only if displayOverlay = "latest"', () => {
		contextState.params.defaultOverlay = DisplayedOverlay.latest;
		actions = hot('--a--', { a: new SetFilteredOverlaysAction([]) });
		const expectedResults = cold('--(ab)--', {
			a: new SetContextParamsAction({ defaultOverlay: null }),
			b: new DisplayOverlayFromStoreAction({ id: 'last' })
		});
		expect(contextAppEffects.displayLatestOverlay$).toBeObservable(expectedResults);
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
		expect(contextAppEffects.displayTwoNearestOverlay$).toBeObservable(expectedResults);
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
		expect(contextAppEffects.displayTwoNearestOverlay$).toBeObservable(expectedResults);
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
		expect(contextAppEffects.displayTwoNearestOverlay$).toBeObservable(expectedResults);
	});

})
;
