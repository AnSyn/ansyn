import { Store, StoreModule } from '@ngrx/store';
import { StatusBarAppEffects } from './status-bar.app.effects';
import { async, inject, TestBed } from '@angular/core/testing';
import { ExpandAction, UpdateGeoFilterStatus } from '@ansyn/status-bar';
import { statusBarFeatureKey, StatusBarReducer } from '@ansyn/status-bar';
import { CasesService } from '@ansyn/menu-items';
import { ICase } from '@ansyn/core';
import { AddCaseAction, SelectCaseAction } from '@ansyn/menu-items';
import { casesFeatureKey, CasesReducer } from '@ansyn/menu-items';
import { Observable } from 'rxjs';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { OverlaysConfig, OverlaysService } from '@ansyn/overlays';
import { OverlayReducer, overlaysFeatureKey } from '@ansyn/overlays';
import { HttpClientModule, HttpBackend  } from '@angular/common/http';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { IOverlay, IOverlaysFetchData } from '@ansyn/core';
import { BaseOverlaySourceProvider, IFetchParams } from '@ansyn/overlays';
import { LoggerService } from '@ansyn/core';

class OverlaySourceProviderMock extends BaseOverlaySourceProvider {
	sourceType = 'Mock';

	public fetch(fetchParams: IFetchParams): Observable<IOverlaysFetchData> {
		return Observable.empty();
	}

	public getStartDateViaLimitFacets(params: { facets, limit, region }): Observable<any> {
		return Observable.empty();
	};

	public getStartAndEndDateViaRangeFacets(params: { facets, limitBefore, limitAfter, date, region }): Observable<any> {
		return Observable.empty();
	};

	public getById(id: string, sourceType: string = null): Observable<IOverlay> {
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
	let fakeCase: ICase;

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
				{ provide: LoggerService, useValue: { error: (some) => null } },
				OverlaysService,
				StatusBarAppEffects,
				provideMockActions(() => actions),
				{ provide: CasesService, useValue: { updateCase: () => null, getOverlaysMarkup: () => null } },
				ImageryCommunicatorService,
				OverlaysService,
				HttpBackend,
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

		store.dispatch(new AddCaseAction(fakeCase));
		store.dispatch(new SelectCaseAction(fakeCase));
	}));

	it('updategeoFilterIndicatorAction$ - add', () => {
		const action = new UpdateGeoFilterStatus({ indicator: true });
		store.dispatch(action);
		const imagery1 = {};
		spyOn(imageryCommunicatorService, 'communicatorsAsArray').and.callFake(() => [imagery1, imagery1, imagery1]);
		actions = hot('--a--', { a: action });
	});


	it('onExpand$', () => {
		actions = hot('--a--', { a: new ExpandAction() });
		const expectedResults = cold('--b--', { b: undefined });
		expect(statusBarAppEffects.onExpand$).toBeObservable(expectedResults);
	});
});
