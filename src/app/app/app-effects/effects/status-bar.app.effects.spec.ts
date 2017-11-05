import { Store, StoreModule } from '@ngrx/store';
import { StatusBarAppEffects } from './status-bar.app.effects';
import { async, inject, TestBed } from '@angular/core/testing';
import {
	ChangeLayoutAction,
	SetGeoFilterAction,
	SetOrientationAction,
	SetTimeAction,
	UpdateStatusFlagsAction
} from '@ansyn/status-bar/actions/status-bar.actions';
import {
	statusBarFeatureKey,
	statusBarFlagsItems,
	StatusBarReducer
} from '@ansyn/status-bar/reducers/status-bar.reducer';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { Case } from '@ansyn/menu-items/cases/models/case.model';
import { AddCaseSuccessAction, SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { casesFeatureKey, CasesReducer } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { Observable } from 'rxjs/Observable';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { OverlaysConfig, OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { ConnectionBackend } from '@angular/http';
import { BackToWorldViewAction, ExpandAction, GoNextAction, GoPrevAction } from '@ansyn/status-bar';
import { BackToWorldAction } from '@ansyn/map-facade';
import { OverlayReducer, overlaysFeatureKey } from '@ansyn/overlays/reducers/overlays.reducer';
import { GoNextDisplayAction, GoPrevDisplayAction } from '@ansyn/overlays/actions/overlays.actions';
import { BaseOverlaySourceProvider, IFetchParams, Overlay } from '@ansyn/overlays';
import { HttpClientModule } from '@angular/common/http';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { DrawPinPointAction } from '@ansyn/map-facade/actions/map.actions';

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

describe('StatusBarAppEffects', () => {
	let statusBarAppEffects: StatusBarAppEffects;
	let actions: Observable<any>;
	let store: Store<any>;
	let casesService: CasesService;
	let imageryCommunicatorService: ImageryCommunicatorService;
	let overlaysService: OverlaysService;
	let fakeCase: Case;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule,

				StoreModule.forRoot({
					[statusBarFeatureKey]: StatusBarReducer,
					[casesFeatureKey]: CasesReducer,
					[overlaysFeatureKey]: OverlayReducer
				})
			],
			providers: [
				OverlaysService,
				StatusBarAppEffects,
				provideMockActions(() => actions),
				{ provide: CasesService, useValue: { updateCase: () => null, getOverlaysMarkup: () => null } },
				ImageryCommunicatorService,
				OverlaysService,
				ConnectionBackend,
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
				{ provide: BaseOverlaySourceProvider, useClass: OverlaySourceProviderMock }
			]
		}).compileComponents();
	}));


	beforeEach(inject([ImageryCommunicatorService, StatusBarAppEffects, Store, CasesService, OverlaysService], (_imageryCommunicatorService, _statusBarAppEffects: StatusBarAppEffects, _store: Store<any>, _casesService: CasesService, _overlaysService: OverlaysService) => {
		statusBarAppEffects = _statusBarAppEffects;

		store = _store;
		casesService = _casesService;
		imageryCommunicatorService = _imageryCommunicatorService;
		overlaysService = _overlaysService;

		fakeCase = {
			id: 'case1',
			state: {
				facets: {},
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
					activeMapId: 'activeMapId',
					data: [
						{
							id: 'activeMapId',
							data: { overlay: { id: 'overlayId1' } }
						}
					]
				},
				favoritesOverlays: []
			}
		} as any;

		store.dispatch(new AddCaseSuccessAction(fakeCase));
		store.dispatch(new SelectCaseAction(fakeCase));
	}));


	it('updatePinPointSearchAction$', () => {
		const action = new UpdateStatusFlagsAction({ key: statusBarFlagsItems.pinPointSearch, value: true });
		store.dispatch(action);
		// mock communicatorsAsArray
		const imagery1 = {
			createMapSingleClickEvent: () => {
			}
		};
		spyOn(imageryCommunicatorService, 'communicatorsAsArray').and.callFake(() => [imagery1, imagery1]);
		spyOn(imagery1, 'createMapSingleClickEvent');
		actions = hot('--a--', { a: action });
		const expectedResults = cold('--b--', { b: undefined });
		expect(statusBarAppEffects.updatePinPointSearchAction$).toBeObservable(expectedResults);
		expect(imagery1.createMapSingleClickEvent).toHaveBeenCalledTimes(2);
	});

	it('updatePinPointIndicatorAction$ - add', () => {

		const action = new UpdateStatusFlagsAction({ key: statusBarFlagsItems.pinPointIndicator, value: true });
		store.dispatch(action);
		const imagery1 = {};
		spyOn(imageryCommunicatorService, 'communicatorsAsArray').and.callFake(() => [imagery1, imagery1, imagery1]);
		actions = hot('--a--', { a: action });

		const expectedResults = cold('--b--', { b: new DrawPinPointAction([-70.33666666666667, 25.5]) });
		expect(statusBarAppEffects.updatePinPointIndicatorAction$).toBeObservable(expectedResults);
	});

	it('updatePinPointIndicatorAction$ - remove', () => {

		const action = new UpdateStatusFlagsAction({ key: statusBarFlagsItems.pinPointIndicator, value: false });
		store.dispatch(action);
		// mock communicatorsAsArray
		const imagery1 = {};
		spyOn(imageryCommunicatorService, 'communicatorsAsArray').and.callFake(() => [imagery1, imagery1, imagery1]);
		actions = hot('--a--', { a: action });

		const expectedResults = cold('--b--', { b: new DrawPinPointAction([-70.33666666666667, 25.5]) });
		expect(statusBarAppEffects.updatePinPointIndicatorAction$).toBeObservable(expectedResults);
	});

	it('selectCase$ should get layersIndex, orientation, geoFilter and time from selectedCase and return all update status-bar actions', () => {
		const layoutsIndex = 2;
		const caseItem: Case = <any> {
			id: '31b33526-6447-495f-8b52-83be3f6b55bd',
			state: {
				maps: {
					layoutsIndex
				},
				orientation: 'orientation',
				geoFilter: 'geoFilter',
				time: { from: 0, to: 100 }
			}
		};
		actions = hot('--a--', { a: new SelectCaseAction(caseItem) });
		const a = new ChangeLayoutAction(layoutsIndex);
		const b = new SetOrientationAction('orientation');
		const c = new SetGeoFilterAction('geoFilter');
		const d = new SetTimeAction({ from: new Date(0), to: new Date(100) });
		const expectedResults = cold('--(abcd)--', { a, b, c, d });
		expect(statusBarAppEffects.selectCase$).toBeObservable(expectedResults);
	});

	it('onBackToWorldView$$ should return BackToWorldAction with no args', () => {
		actions = hot('--a--', { a: new BackToWorldViewAction() });
		const expectedResults = cold('--b--', { b: new BackToWorldAction() });
		expect(statusBarAppEffects.onBackToWorldView$).toBeObservable(expectedResults);
	});

	describe('onGoPrevNext$', () => {
		it('should return onGoNextDisplayAction (type of action is GoNextAction) with current overlayId ', () => {
			actions = hot('--a--', { a: new GoNextAction() }); // current overlay overlayId1
			const expectedResults = cold('--b--', { b: new GoNextDisplayAction('overlayId1') });
			expect(statusBarAppEffects.onGoPrevNext$).toBeObservable(expectedResults);
		});

		it('should return onGoPrevDisplayAction (type of action is GoPrevAction) with current overlayId', () => {
			actions = hot('--a--', { a: new GoPrevAction() }); // current overlay overlayId1
			const expectedResults = cold('--b--', { b: new GoPrevDisplayAction('overlayId1') });
			expect(statusBarAppEffects.onGoPrevNext$).toBeObservable(expectedResults);
		});
	});

	it('onExpand$', () => {
		actions = hot('--a--', { a: new ExpandAction() });
		const expectedResults = cold('--b--', { b: undefined });
		expect(statusBarAppEffects.onExpand$).toBeObservable(expectedResults);
	});

	// it('onFavorite$ with favorites and showOnlyFavorites off', () => {
	// 	actions = hot('--a--', { a: new FavoriteAction('overlayId1') });
	// 	const expectedResults = cold('--b--', { b: new SetFavoriteAction('overlayId1') });
	// 	expect(statusBarAppEffects.onFavorite$).toBeObservable(expectedResults);
	//
	// 	let counter = 0;
	// 	statusBarAppEffects.onFavorite$.subscribe((result) => {
	// 		counter++;
	// 		if (result instanceof UpdateCaseAction) {
	// 			expect(result.payload.state.favoritesOverlays[0]).toBe('overlayId1');
	// 		}
	//
	// 	});
	// 	expect(counter).toBe(1);
	// });
	//
	// it('onFavorite$ with favorites and showOnlyFavorites on (unfavorite)', () => {
	// 	const testCase = cloneDeep(fakeCase);
	// 	testCase.state.facets.showOnlyFavorites = true;
	// 	testCase.state.favoritesOverlays.push('overlayId1');
	// 	store.dispatch(new UpdateCaseAction(testCase));
	// 	actions = hot('--a--', { a: new FavoriteAction() });
	// 	let count = 0;
	// 	statusBarAppEffects.onFavorite$.subscribe((result) => {
	// 		count++;
	// 		if (result instanceof UpdateCaseAction) {
	// 			expect(count).toBe(1);
	// 			expect(result.payload.state.favoritesOverlays.length).toBe(0);
	// 		}
	//
	// 	});
	// 	expect(count).toBe(1);
	// });
});
