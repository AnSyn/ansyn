import { cloneDeep } from 'lodash';
import { inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { EMPTY, Observable, of } from 'rxjs';
import {
	DisplayOverlayAction,
	LoadOverlaysAction,
	LoadOverlaysSuccessAction,
	RequestOverlayByIDFromBackendAction
} from '../actions/overlays.actions';
import { OverlaysEffects } from './overlays.effects';
import { OverlaysService } from '../services/overlays.service';
import {
	OverlayReducer,
	overlaysAdapter,
	overlaysFeatureKey,
	overlaysInitialState,
	overlaysStateSelector
} from '../reducers/overlays.reducer';
import { cold, hot } from 'jasmine-marbles';
import { provideMockActions } from '@ngrx/effects/testing';
import { BaseOverlaySourceProvider, IFetchParams } from '../models/base-overlay-source-provider.model';
import { LoggerService } from '../../core/services/logger.service';
import { OverlaySourceProvider } from '../models/overlays-source-providers';
import { imageryStatusFeatureKey, imageryStatusInitialState } from '@ansyn/map-facade';
import { IOverlay } from '../models/overlay.model';
import { MissingTranslationHandler, TranslateModule, USE_DEFAULT_LANG } from '@ngx-translate/core';
import { AreaToCredentialsService } from "../../core/services/credentials/area-to-credentials.service";
import { CredentialsService } from "../../core/services/credentials/credentials.service";
import { Area } from "d3-shape";
import { credentialsConfig } from "../../core/services/credentials/config";
import { HttpClientModule } from "@angular/common/http";

@OverlaySourceProvider({
	sourceType: 'Mock'
})
class OverlaySourceProviderMock extends BaseOverlaySourceProvider {
	public fetch(fetchParams: IFetchParams): any {
		return EMPTY;
	}

	public getStartDateViaLimitFacets(params: { facets, limit, region }): any {
		return EMPTY;
	};

	public getStartAndEndDateViaRangeFacets(params: { facets, limitBefore, limitAfter, date, region }): Observable<any> {
		return EMPTY;
	};

	public getById(id: string, sourceType: string = null): Observable<IOverlay> {
		return EMPTY;
	};
}


describe('Overlays Effects ', () => {
	let store: Store<any>;
	let credentialsService: CredentialsService;
	let areaToCredentialsService: AreaToCredentialsService;
	let actions: Observable<any>;
	let overlaysEffects: OverlaysEffects;
	let overlaysService: OverlaysService | any;

	const overlays = <IOverlay[]>[
		{
			id: '12',
			name: 'tmp12',
			photoTime: new Date(Date.now()).toISOString(),
			azimuth: 10,
			footprint: {}
		},
		{
			id: '13',
			name: 'tmp13',
			photoTime: new Date(Date.now()).toISOString(),
			azimuth: 10,
			footprint: {}
		}
	];
	beforeEach(() => TestBed.configureTestingModule({
		imports: [
			HttpClientModule,
			StoreModule.forRoot({ [overlaysFeatureKey]: OverlayReducer }),
			TranslateModule.forRoot()
		],
		providers: [
			{ provide: USE_DEFAULT_LANG },
			{
				provide: MissingTranslationHandler, useValue: {
					handle: () => ''
				}
			},
			{ provide: LoggerService, useValue: { error: (some) => null } },
			OverlaysEffects, {
				provide: OverlaysService,
				useValue: jasmine.createSpyObj('overlaysService', ['getByCase', 'search', 'getTimeStateByOverlay', 'getOverlayById'])
			},
			{
				provide: CredentialsService,
				useValue: {
					user: {name: 'user'},
					error: {message: ''},
					getCredentials() {
						return EMPTY;
					}
				}
			},
			{
				provide: AreaToCredentialsService,
				useValue: jasmine.createSpyObj('areaToCredentialsService', ['getUrl', 'createRequest', 'getAreaTriangles', 'parseResponse'])
			},
			{
				provide: credentialsConfig,
				useValue: {
					noCredentialsMessage: 'TEST'
				}
			},
			provideMockActions(() => actions),
			{ provide: BaseOverlaySourceProvider, useClass: OverlaySourceProviderMock }
		]
	}));

	beforeEach(inject([CredentialsService, AreaToCredentialsService, Store], (_credentialsService: CredentialsService, _areaToCredentialsService: AreaToCredentialsService, _store: Store<any>) => {
		store = _store;
		credentialsService = _credentialsService;
		areaToCredentialsService = _areaToCredentialsService;
		const imageryStatusState = { ...imageryStatusInitialState };
		let overlayState = cloneDeep(overlaysInitialState);
		overlayState = overlaysAdapter.addAll(overlays, overlayState);

		const fakeStore = new Map<any, any>([
			[imageryStatusFeatureKey, imageryStatusState],
			[overlaysStateSelector, overlayState]
		]);
		spyOn(store, 'select').and.callFake((selector) => of(fakeStore.get(selector)));
	}));

	beforeEach(inject([Store, OverlaysEffects, OverlaysService, AreaToCredentialsService, CredentialsService], (_store: Store<any>, _overlaysEffects: OverlaysEffects, _overlaysService: OverlaysService, _areaToCredentialsService: AreaToCredentialsService,_credentialsService: CredentialsService) => {
		store = _store;
		credentialsService = _credentialsService;
		areaToCredentialsService = _areaToCredentialsService;
		overlaysEffects = _overlaysEffects;
		overlaysService = _overlaysService;
	}));


	it('it should load all the overlays', () => {
		overlaysService.search.and.returnValue(of({ data: overlays, limited: 0, errors: [] }));
		actions = hot('--a--', { a: new LoadOverlaysAction({}) });
		const expectedResults = cold('--(a)--', {
			a: new LoadOverlaysSuccessAction(overlays)
		});
		expect(overlaysEffects.loadOverlays$).toBeObservable(expectedResults);
	});

	it('onRequestOverlayByID$ from IDAHO should dispatch DisplayOverlayAction with overlay', () => {
		const fakeOverlay = <IOverlay>{ id: 'test' };
		overlaysService.getOverlayById.and.returnValue(of(fakeOverlay));
		actions = hot('--a--', {
			a: new RequestOverlayByIDFromBackendAction({
				overlayId: 'test',
				sourceType: 'IDAHO',
				mapId: 'testMapId'
			})
		});
		const expectedResults = cold('--b--', {
			b: new DisplayOverlayAction({
				overlay: <any>fakeOverlay,
				mapId: 'testMapId',
				forceFirstDisplay: true
			})
		});
		expect(overlaysEffects.onRequestOverlayByID$).toBeObservable(expectedResults);

	});

	it('onRequestOverlayByID$ from PLANET should dispatch DisplayOverlayAction with overlay', () => {
		const fakeOverlay = <IOverlay>{ id: 'test' };
		overlaysService.getOverlayById.and.returnValue(of(fakeOverlay));
		actions = hot('--a--', {
			a: new RequestOverlayByIDFromBackendAction({
				overlayId: 'test',
				sourceType: 'PLANET',
				mapId: 'testMapId'
			})
		});
		const expectedResults = cold('--b--', {
			b: new DisplayOverlayAction({
				overlay: <any>fakeOverlay,
				mapId: 'testMapId',
				forceFirstDisplay: true
			})
		});
		expect(overlaysEffects.onRequestOverlayByID$).toBeObservable(expectedResults);

	});

});


