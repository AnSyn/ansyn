import { Store, StoreModule } from '@ngrx/store';
import { StatusBarAppEffects } from './status-bar.app.effects';
import { async, inject, TestBed } from '@angular/core/testing';
import { UpdateStatusFlagsAction } from '@ansyn/status-bar/actions/status-bar.actions';
import {
	statusBarFeatureKey,
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
import { BackToWorldViewAction, ExpandAction, GoNextAction, GoPrevAction, statusBarFlagsItems } from '@ansyn/status-bar';
import { BackToWorldAction } from '@ansyn/map-facade';
import { OverlayReducer, overlaysFeatureKey } from '@ansyn/overlays/reducers/overlays.reducer';
import { GoNextDisplayAction, GoPrevDisplayAction } from '@ansyn/overlays/actions/overlays.actions';
import { BaseOverlaySourceProvider, IFetchParams, Overlay } from '@ansyn/overlays';
import { HttpClientModule } from '@angular/common/http';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { DrawPinPointAction } from '@ansyn/map-facade/actions/map.actions';
import { OverlaysFetchData } from '@ansyn/core/models/overlay.model';

class OverlaySourceProviderMock extends BaseOverlaySourceProvider {
	sourceType = 'Mock';

	public fetch(fetchParams: IFetchParams): Observable<OverlaysFetchData> {
		return Observable.empty();
	}

	public getStartDateViaLimitFacets(params: { facets, limit, region }): Observable<any> {
		return Observable.empty();
	};

	public getStartAndEndDateViaRangeFacets(params: { facets, limitBefore, limitAfter, date, region }): Observable<any> {
		return Observable.empty();
	};

	public getById(id: string, sourceType: string = null): Observable<Overlay> {
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
					provide: OverlaysConfig,
					useValue: {
						'limit': 500
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
				favoriteOverlays: []
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

		const action = new UpdateStatusFlagsAction({ key: statusBarFlagsItems.pinPointIndicator });
		store.dispatch(action);
		// mock communicatorsAsArray
		const imagery1 = {};
		spyOn(imageryCommunicatorService, 'communicatorsAsArray').and.callFake(() => [imagery1, imagery1, imagery1]);
		actions = hot('--a--', { a: action });

		const expectedResults = cold('--b--', { b: new DrawPinPointAction([-70.33666666666667, 25.5]) });
		expect(statusBarAppEffects.updatePinPointIndicatorAction$).toBeObservable(expectedResults);
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
});
