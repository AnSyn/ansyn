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
	SetTimelineStateAction
} from '../actions/overlays.actions';
import { Overlay } from '../models/overlay.model';
import { OverlaysEffects } from './overlays.effects';
import { OverlaysConfig, OverlaysService } from '../services/overlays.service';
import { OverlayReducer, overlaysFeatureKey } from '../reducers/overlays.reducer';
import { casesFeatureKey, CasesReducer } from '../../menu-items/cases/reducers/cases.reducer';
import { IAppState } from '../../../app-reducers/app-reducers.module';
import { BaseOverlaySourceProvider, IFetchParams } from '@ansyn/overlays';
import { cold, hot } from 'jasmine-marbles';
import { provideMockActions } from '@ngrx/effects/testing';
import { IOverlaysConfig } from '../models/overlays.config';

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


describe('Overlays Effects ', () => {
	let actions: Observable<any>;
	let overlaysEffects: OverlaysEffects;
	let overlaysService: OverlaysService | any;
	let overlaysConfig: IOverlaysConfig;

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

	let store: Store<IAppState>;

	beforeEach(() => TestBed.configureTestingModule({
		imports: [
			StoreModule.forRoot({ [overlaysFeatureKey]: OverlayReducer, [casesFeatureKey]: CasesReducer })
		],
		providers: [
			OverlaysEffects, {
				provide: OverlaysService,
				useValue: jasmine.createSpyObj('overlaysService', ['getByCase', 'search', 'getTimeStateByOverlay', 'getOverlayById'])
			},
			provideMockActions(() => actions),
			{ provide: OverlaysConfig, useValue: {} },
			{ provide: BaseOverlaySourceProvider, useClass: OverlaySourceProviderMock }
		]
	}));

	beforeEach(inject([Store, OverlaysEffects, OverlaysService], (_store: Store<any>, _overlaysEffects: OverlaysEffects, _overlaysService: OverlaysService) => {
		store = _store;
		overlaysEffects = _overlaysEffects;
		overlaysService = _overlaysService;
		overlaysConfig = TestBed.get(OverlaysConfig);
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
		overlays.forEach(i => tmp.push(Object.assign({}, i, {})));
		overlaysService.search.and.returnValue(Observable.of(overlays));
		actions = hot('--a--', { a: new LoadOverlaysAction() });
		const expectedResults = cold('--b--', { b: new LoadOverlaysSuccessAction(tmp) });
		expect(overlaysEffects.loadOverlays$).toBeObservable(expectedResults);
	});

	it('onRequestOverlayByID$ should dispatch DisplayOverlayAction with overlay', () => {
		const fakeOverlay = <Overlay> { id: 'test' };
		overlaysService.getOverlayById.and.returnValue(Observable.of(fakeOverlay));
		actions = hot('--a--', {
			a: new RequestOverlayByIDFromBackendAction({
				overlayId: 'test',
				map_id: 'testMapId'
			})
		});
		const expectedResults = cold('--b--', {
			b: new DisplayOverlayAction(<any>{
				overlay: fakeOverlay,
				map_id: 'testMapId'
			})
		});
		expect(overlaysEffects.onRequestOverlayByID$).toBeObservable(expectedResults);

	});

	describe('displayOverlaySetTimeline$ should have been dispatch when overlay is displaying on active map, and timeline should be moved', () => {
		it('should be moved forwards', () => {
			const getTimeStateByOverlayResult = { from: new Date(1500), to: new Date(6500) };
			overlaysService.getTimeStateByOverlay.and.callFake(() => getTimeStateByOverlayResult);
			const timelineState = { from: new Date(0), to: new Date(5000) };
			store.dispatch(new SetTimelineStateAction({ state: timelineState }));
			const action = new DisplayOverlayAction({ overlay: <Overlay> { date: new Date(6000) } });
			actions = hot('--a--', { a: action });
			const expectedResults = cold('--b--', { b: new SetTimelineStateAction({ state: getTimeStateByOverlayResult }) });
			expect(overlaysEffects.displayOverlaySetTimeline$).toBeObservable(expectedResults);
		});

		it('should be moved backwards', () => {
			const getTimeStateByOverlayResult = { from: new Date(1500), to: new Date(6500) };
			overlaysService.getTimeStateByOverlay.and.callFake(() => getTimeStateByOverlayResult);
			const timelineState = {
				from: new Date(5000),
				to: new Date(10000)
			};
			store.dispatch(new SetTimelineStateAction({ state: timelineState }));
			actions = hot('--a--', { a: new DisplayOverlayAction({ overlay: <Overlay> { date: new Date(4000) } }) });
			const expectedResults = cold('--b--', { b: new SetTimelineStateAction({ state: getTimeStateByOverlayResult }) });
			expect(overlaysEffects.displayOverlaySetTimeline$).toBeObservable(expectedResults);
		});
	});

	it('onDisplayOverlayFromStore$ should get id and call DisplayOverlayAction with overlay from store', () => {
		const loadedOverlays = [
			{ id: 'tmp', image: 'tmp_img' },
			{ id: 'tmp2', image: 'tmp_img2' }
		];
		store.dispatch(new LoadOverlaysSuccessAction(loadedOverlays as any));
		actions = hot('--a--', { a: new DisplayOverlayFromStoreAction({ id: 'tmp', map_id: '4444' }) });
		const expectedResults = cold('--b--', {
			b: new DisplayOverlayAction({
				overlay: <any>loadedOverlays[0],
				map_id: '4444'
			})
		});
		expect(overlaysEffects.onDisplayOverlayFromStore$).toBeObservable(expectedResults);
	});
});
