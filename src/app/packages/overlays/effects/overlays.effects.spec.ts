import { cloneDeep } from 'lodash';
import { inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import {
	DisplayOverlayAction,
	DisplayOverlayFromStoreAction,
	LoadOverlaysAction,
	LoadOverlaysSuccessAction,
	OverlaysMarkupAction,
	RedrawTimelineAction,
	RequestOverlayByIDFromBackendAction,
	SyncOverlaysWithFavoritesOnLoadingAction
} from '../actions/overlays.actions';
import { Overlay } from '../models/overlay.model';
import { OverlaysEffects } from './overlays.effects';
import { OverlaysService } from '../services/overlays.service';
import { OverlayReducer, overlaysFeatureKey, overlaysInitialState, overlaysStateSelector } from '../reducers/overlays.reducer';
import { BaseOverlaySourceProvider, IFetchParams } from '@ansyn/overlays';
import { cold, hot } from 'jasmine-marbles';
import { provideMockActions } from '@ngrx/effects/testing';
import { coreInitialState, coreStateSelector, UpdateFavoriteOverlaysMetadataAction } from '@ansyn/core';

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

	public getById(id: string, sourceType: string = null): Observable<Overlay> {
		return Observable.empty();
	};
}


describe('Overlays Effects ', () => {
	let store: Store<any>;
	let actions: Observable<any>;
	let overlaysEffects: OverlaysEffects;
	let overlaysService: OverlaysService | any;

	const overlays = <Overlay[]>[
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
	const favoriteOverlays = <Overlay[]>[
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

	it('effect - onOverlaysMarkupChanged$', () => {
		const action = new OverlaysMarkupAction({});
		actions = hot('--a--', { a: action });
		const expectedResults = cold('--b--', { b: action });
		expect(overlaysEffects.onOverlaysMarkupChanged$).toBeObservable(expectedResults);
	});

	it('effect - onRedrawTimeline$', () => {
		const action = new RedrawTimelineAction();
		actions = hot('--a--', { a: action });
		const expectedResults = cold('--b--', { b: action });
		expect(overlaysEffects.onRedrawTimeline$).toBeObservable(expectedResults);
	});

	it('it should load all the overlays', () => {
		let tmp = <Overlay[]>[];
		overlays.forEach(overlay => tmp.push({ ...overlay }));
		overlaysService.search.and.returnValue(Observable.of({ data: overlays, limited: 0 }));
		actions = hot('--a--', { a: new LoadOverlaysAction() });
		const expectedResults = cold('--b--', { b: new SyncOverlaysWithFavoritesOnLoadingAction(tmp) });
		expect(overlaysEffects.loadOverlays$).toBeObservable(expectedResults);
	});

	it('it should sync the overlays with favorites', () => {
		actions = hot('--a--', { a: new SyncOverlaysWithFavoritesOnLoadingAction(overlays) });
		const expectedOverlays = overlays.slice();
		expectedOverlays.push(favoriteOverlays[1]);

		const expectedFavorites = favoriteOverlays.slice();

		const expectedResults = cold('--(ab)--', {
			a: new UpdateFavoriteOverlaysMetadataAction(expectedFavorites),
			b: new LoadOverlaysSuccessAction(expectedOverlays)
		});
		expect(overlaysEffects.syncOverlaysOnLoading$).toBeObservable(expectedResults);
	});

	it('onRequestOverlayByID$ should dispatch DisplayOverlayAction with overlay', () => {
		const fakeOverlay = <Overlay> { id: 'test' };
		overlaysService.getOverlayById.and.returnValue(Observable.of(fakeOverlay));
		actions = hot('--a--', {
			a: new RequestOverlayByIDFromBackendAction({
				overlayId: 'test',
				sourceType: 'IDAHO',
				mapId: 'testMapId'
			})
		});
		const expectedResults = cold('--b--', {
			b: new DisplayOverlayAction(<any>{
				overlay: fakeOverlay,
				mapId: 'testMapId'
			})
		});
		expect(overlaysEffects.onRequestOverlayByID$).toBeObservable(expectedResults);

	});

	it('onDisplayOverlayFromStore$ should get id and call DisplayOverlayAction with overlay from store', () => {
		actions = hot('--a--', {
			a: new DisplayOverlayFromStoreAction({
				id: overlays[0].id,
				mapId: '4444'
			})
		});
		const expectedResults = cold('--b--', {
			b: new DisplayOverlayAction({
				overlay: overlays[0],
				mapId: '4444'
			})
		});
		expect(overlaysEffects.onDisplayOverlayFromStore$).toBeObservable(expectedResults);
	});
});
