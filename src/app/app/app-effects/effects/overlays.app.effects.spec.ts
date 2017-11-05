import { inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { OverlaysAppEffects } from './overlays.app.effects';
import {
	DisplayOverlayAction,
	DisplayOverlayFromStoreAction,
	LoadOverlaysAction,
	LoadOverlaysSuccessAction,
	OverlaysMarkupAction,
	SetFiltersAction,
	SetTimelineStateAction
} from '@ansyn/overlays/actions/overlays.actions';
import { Case, CasesReducer, CasesService } from '@ansyn/menu-items/cases';
import { OverlaysConfig, OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { BaseOverlaySourceProvider } from '@ansyn/overlays/models/base-overlay-source-provider.model';
import { OverlaySourceProviderMock } from '@ansyn/overlays/services/overlays.service.spec';
import { OverlayReducer, overlaysFeatureKey, overlaysStateSelector } from '@ansyn/overlays/reducers/overlays.reducer';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { Observable } from 'rxjs/Observable';
import { cloneDeep } from 'lodash';
import {
	IToolsState,
	toolsFeatureKey,
	toolsInitialState,
	ToolsReducer,
	toolsStateSelector
} from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { HttpClientModule } from '@angular/common/http';
import { provideMockActions } from '@ngrx/effects/testing';
import { casesFeatureKey, casesStateSelector } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { cold, hot } from 'jasmine-marbles';
import { SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { overlaysInitialState } from '@ansyn/overlays/reducers/overlays.reducer';

describe('OverlaysAppEffects', () => {
	let overlaysAppEffects: OverlaysAppEffects;
	let actions: Observable<any>;
	let store: Store<any>;
	let casesService: CasesService;
	let overlaysService: OverlaysService;
	let imageryCommunicatorService: ImageryCommunicatorService;
	let toolsState: IToolsState;
	let imageryCommunicatorServiceMock = {
		provide: () => {
		}
	};
	const overlaysState = overlaysInitialState;
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
				}]
			},
			'time': {
				'type': 'absolute',
				'from': new Date('2013-06-27T08:43:03.624Z'),
				'to': new Date('2015-04-17T03:55:12.129Z')
			},
			maps: {
				data: [
					{ id: 'imagery1', data: { overlayDisplayMode: 'Hitmap' } },
					{ id: 'imagery2', data: { overlayDisplayMode: 'None' } },
					{ id: 'imagery3', data: {} },
				],
				activeMapId: 'imagery1'
			}
		}
	} as any;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				StoreModule.forRoot({
					[casesFeatureKey]: CasesReducer,
					[overlaysFeatureKey]: OverlayReducer,
					[toolsFeatureKey]: ToolsReducer
				}),
			],
			providers: [
				OverlaysAppEffects,
				provideMockActions(() => actions),
				{ provide: BaseOverlaySourceProvider, useClass: OverlaySourceProviderMock },
				{ provide: OverlaysConfig, useValue: {} },
				{
					provide: OverlaysService,
					useValue: jasmine.createSpyObj('overlaysService', ['getByCase', 'search', 'getTimeStateByOverlay', 'getOverlayById'])
				},
				{
					provide: CasesService,
					useValue: {
						getOverlaysMarkup: () => null,
						contextValues: { imageryCount: -1 }
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
		toolsState = cloneDeep(toolsInitialState);
		overlaysState.filteredOverlays = ['first', 'last'];

		const fakeStore = new Map<any, any>([
			[casesStateSelector, {
				selectedCase: caseItem,
				cases: [caseItem]
			}],
			[overlaysStateSelector, overlaysState],
			[toolsStateSelector, toolsState]
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

	it('onOverlaysMarkupsChanged$', () => {
		spyOn(CasesService, 'getOverlaysMarkup').and.returnValue({});
		const action = new LoadOverlaysSuccessAction({} as any);
		actions = hot('--a--', { a: action });
		const expectedResults = cold('--b--', { b: new OverlaysMarkupAction({}) });
		expect(overlaysAppEffects.onOverlaysMarkupsChanged$).toBeObservable(expectedResults);
	});

	it('On selectCase$ call to loadOverlaysAction with case params ', () => {
		actions = hot('--a--', { a: new SelectCaseAction(caseItem) });
		const expectedResults = cold('--b--', {
			b: new LoadOverlaysAction({
				to: caseItem.state.time.to,
				from: caseItem.state.time.from,
				polygon: caseItem.state.region,
				caseId: caseItem.id
			})
		});
		expect(overlaysAppEffects.selectCase$).toBeObservable(expectedResults);
	});

	it('displayLatestOverlay$ effect should have been call only if displayOverlay = "latest"', () => {
		casesService.contextValues.defaultOverlay = 'latest';
		actions = hot('--a--', { a: new SetFiltersAction([]) });
		const expectedResults = cold('--b--', {
			b: new DisplayOverlayFromStoreAction({
				id: 'last'
			})
		});
		expect(overlaysAppEffects.displayLatestOverlay$).toBeObservable(expectedResults);
	});

	describe('displayOverlaySetTimeline$ should have been dispatch when overlay is displaying on active map, and timeline should be moved', () => {
		it('should be moved forwards', () => {
			const getTimeStateByOverlayResult = { from: new Date(1500), to: new Date(6500) };
			(<any>overlaysService.getTimeStateByOverlay).and.callFake(() => getTimeStateByOverlayResult);
			overlaysState.timelineState = { from: new Date(0), to: new Date(5000) };
			const action = new DisplayOverlayAction({ overlay: <Overlay> { date: new Date(6000) } });
			actions = hot('--a--', { a: action });
			const expectedResults = cold('--b--', { b: new SetTimelineStateAction({ state: getTimeStateByOverlayResult }) });
			expect(overlaysAppEffects.displayOverlaySetTimeline$).toBeObservable(expectedResults);
		});

		it('should be moved backwards', () => {
			const getTimeStateByOverlayResult = { from: new Date(1500), to: new Date(6500) };
			(<any>overlaysService.getTimeStateByOverlay).and.callFake(() => getTimeStateByOverlayResult);
			overlaysState.timelineState = {
				from: new Date(5000),
				to: new Date(10000)
			};

			actions = hot('--a--', { a: new DisplayOverlayAction({ overlay: <Overlay> { date: new Date(4000) } }) });
			const expectedResults = cold('--b--', { b: new SetTimelineStateAction({ state: getTimeStateByOverlayResult }) });
			expect(overlaysAppEffects.displayOverlaySetTimeline$).toBeObservable(expectedResults);
		});
	});

});
