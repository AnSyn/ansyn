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
import { imageryStatusInitialState, imageryStatusFeatureKey } from '@ansyn/map-facade';
import { IOverlay } from '../models/overlay.model';
import { TranslateModule, USE_DEFAULT_LANG, MissingTranslationHandler } from '@ngx-translate/core';

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
			provideMockActions(() => actions),
			{ provide: BaseOverlaySourceProvider, useClass: OverlaySourceProviderMock }
		]
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
		const imageryStatusState = { ...imageryStatusInitialState };
		let overlayState = cloneDeep(overlaysInitialState);
		overlayState = overlaysAdapter.addAll(overlays, overlayState);

		const fakeStore = new Map<any, any>([
			[imageryStatusFeatureKey, imageryStatusState],
			[overlaysStateSelector, overlayState]
		]);
		spyOn(store, 'select').and.callFake((selector) => of(fakeStore.get(selector)));
	}));

	beforeEach(inject([Store, OverlaysEffects, OverlaysService], (_store: Store<any>, _overlaysEffects: OverlaysEffects, _overlaysService: OverlaysService) => {
		store = _store;
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


