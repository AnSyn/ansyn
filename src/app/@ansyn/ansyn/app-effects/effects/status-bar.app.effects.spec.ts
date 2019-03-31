import { Store, StoreModule } from '@ngrx/store';
import { StatusBarAppEffects } from './status-bar.app.effects';
import { async, inject, TestBed } from '@angular/core/testing';
import { AddCaseAction, SelectCaseAction } from '../../modules/menu-items/cases/actions/cases.actions';
import { ICase, IOverlay, IOverlaysFetchData } from '@ansyn/imagery';
import { EMPTY, Observable } from 'rxjs';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { HttpBackend, HttpClientModule } from '@angular/common/http';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { ExpandAction, UpdateGeoFilterStatus } from '../../modules/status-bar/actions/status-bar.actions';
import { statusBarFeatureKey, StatusBarReducer } from '../../modules/status-bar/reducers/status-bar.reducer';
import { CasesService } from '../../modules/menu-items/cases/services/cases.service';
import { casesFeatureKey, CasesReducer } from '../../modules/menu-items/cases/reducers/cases.reducer';
import { LoggerService } from '../../modules/core/services/logger.service';
import { OverlayReducer, overlaysFeatureKey } from '../../modules/overlays/reducers/overlays.reducer';
import {
	BaseOverlaySourceProvider,
	IFetchParams
} from '../../modules/overlays/models/base-overlay-source-provider.model';
import { MultipleOverlaysSourceProvider } from '../../modules/overlays/services/multiple-source-provider';
import { OverlaysConfig, OverlaysService } from '../../modules/overlays/services/overlays.service';
import { OverlaySourceProvider } from '../../modules/overlays/models/overlays-source-providers';

@OverlaySourceProvider({
	sourceType: 'Mock'
})
class OverlaySourceProviderMock extends BaseOverlaySourceProvider {
	public fetch(fetchParams: IFetchParams): Observable<IOverlaysFetchData> {
		return EMPTY;
	}

	public getStartDateViaLimitFacets(params: { facets, limit, region }): Observable<any> {
		return EMPTY;
	};

	public getStartAndEndDateViaRangeFacets(params: { facets, limitBefore, limitAfter, date, region }): Observable<any> {
		return EMPTY;
	};

	public getById(id: string, sourceType: string = null): Observable<IOverlay> {
		return EMPTY;
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
				HttpBackend,
				{
					provide: OverlaysConfig,
					useValue: {
						'limit': 500
					}
				},
				{ provide: MultipleOverlaysSourceProvider, useClass: OverlaySourceProviderMock }
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

	it('onExpand$', () => {
		actions = hot('--a--', { a: new ExpandAction() });
		const expectedResults = cold('--b--', { b: undefined });
		expect(statusBarAppEffects.onExpand$).toBeObservable(expectedResults);
	});
});
