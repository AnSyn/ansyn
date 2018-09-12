import { cloneDeep, unionBy } from 'lodash';
import { inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
	DisplayOverlayAction, LoadOverlaysAction, LoadOverlaysSuccessAction,
	RequestOverlayByIDFromBackendAction
} from '../actions/overlays.actions';
import { OverlaysEffects } from './overlays.effects';
import { OverlaysService } from '../services/overlays.service';
import {
	OverlayReducer, overlaysFeatureKey, overlaysInitialState,
	overlaysStateSelector
} from '../reducers/overlays.reducer';
import { cold, hot } from 'jasmine-marbles';
import { provideMockActions } from '@ngrx/effects/testing';
import { LoggerService } from '@ansyn/core';
import { BaseOverlaySourceProvider, IFetchParams } from '../models/base-overlay-source-provider.model';
import { coreInitialState, coreStateSelector } from '@ansyn/core';
import { IOverlay } from '@ansyn/core';

class OverlaySourceProviderMock extends BaseOverlaySourceProvider {
	sourceType = 'Mock';

	public fetch(fetchParams: IFetchParams): any {
		return Observable.empty();
	}

	public getStartDateViaLimitFacets(params: { facets, limit, region }): any {
		return Observable.empty();
	};

	public getStartAndEndDateViaRangeFacets(params: { facets, limitBefore, limitAfter, date, region }): Observable<any> {
		return Observable.empty();
	};

	public getById(id: string, sourceType: string = null): Observable<IOverlay> {
		return Observable.empty();
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
	const favoriteOverlays = <IOverlay[]>[
		{
			id: '13',
			name: 'tmp13',
			photoTime: new Date(Date.now()).toISOString(),
			azimuth: 10,
			footprint: {}
		},
		{
			id: '14',
			name: 'tmp14',
			photoTime: new Date(Date.now()).toISOString(),
			azimuth: 14,
			footprint: {}
		}
	];
	beforeEach(() => TestBed.configureTestingModule({
		imports: [
			StoreModule.forRoot({ [overlaysFeatureKey]: OverlayReducer })
		],
		providers: [
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
		const coreState = { ...coreInitialState };
		const overlayState = cloneDeep(overlaysInitialState);
		overlays.forEach(o => overlayState.overlays.set(o.id, o));
		coreState.favoriteOverlays = favoriteOverlays;

		const fakeStore = new Map<any, any>([
			[coreStateSelector, coreState],
			[overlaysStateSelector, overlayState]
		]);
		spyOn(store, 'select').and.callFake((selector) => Observable.of(fakeStore.get(selector)));
	}));

	beforeEach(inject([Store, OverlaysEffects, OverlaysService], (_store: Store<any>, _overlaysEffects: OverlaysEffects, _overlaysService: OverlaysService) => {
		store = _store;
		overlaysEffects = _overlaysEffects;
		overlaysService = _overlaysService;
	}));


	it('it should load all the overlays', () => {
		let tmp = <IOverlay[]>unionBy([...overlays], [...favoriteOverlays], o => o.id);
		overlaysService.search.and.returnValue(Observable.of({ data: overlays, limited: 0, errors: [] }));
		actions = hot('--a--', { a: new LoadOverlaysAction({}) });
		const expectedResults = cold('--(a)--', {
			a: new LoadOverlaysSuccessAction(tmp)
		});
		expect(overlaysEffects.loadOverlays$).toBeObservable(expectedResults);
	});

	it('onRequestOverlayByID$ from IDAHO should dispatch DisplayOverlayAction with overlay', () => {
		const fakeOverlay = <IOverlay> { id: 'test' };
		overlaysService.getOverlayById.and.returnValue(Observable.of(fakeOverlay));
		actions = hot('--a--', {
			a: new RequestOverlayByIDFromBackendAction({
				overlayId: 'test',
				sourceType: 'IDAHO',
				mapId: 'testMapId'
			})
		});
		const expectedResults = cold('--b--', {
			b: new DisplayOverlayAction({
				overlay: <any> fakeOverlay,
				mapId: 'testMapId',
				forceFirstDisplay: true
			})
		});
		expect(overlaysEffects.onRequestOverlayByID$).toBeObservable(expectedResults);

	});

	it('onRequestOverlayByID$ from PLANET should dispatch DisplayOverlayAction with overlay', () => {
		const fakeOverlay = <IOverlay> { id: 'test' };
		overlaysService.getOverlayById.and.returnValue(Observable.of(fakeOverlay));
		actions = hot('--a--', {
			a: new RequestOverlayByIDFromBackendAction({
				overlayId: 'test',
				sourceType: 'PLANET',
				mapId: 'testMapId'
			})
		});
		const expectedResults = cold('--b--', {
			b: new DisplayOverlayAction({
				overlay: <any> fakeOverlay,
				mapId: 'testMapId',
				forceFirstDisplay: true
			})
		});
		expect(overlaysEffects.onRequestOverlayByID$).toBeObservable(expectedResults);

	});

});


