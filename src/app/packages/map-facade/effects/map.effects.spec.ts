import { MapEffects } from './map.effects';
import { Observable } from 'rxjs/Observable';
import { Store, StoreModule } from '@ngrx/store';
import { async, inject, TestBed } from '@angular/core/testing';
import { IMapState, initialMapState, mapFeatureKey, MapReducer, mapStateSelector } from '../reducers/map.reducer';
import { provideMockActions } from '@ngrx/effects/testing';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { MapFacadeService } from '../services/map-facade.service';
import { cloneDeep } from 'lodash';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { cold, hot } from 'jasmine-marbles';
import {
	ActiveMapChangedAction,
	AddMapInstanceAction,
	AnnotationContextMenuTriggerAction,
	DecreasePendingMapsCountAction,
	EnableMapGeoOptionsActionStore,
	RemoveMapInstanceAction,
	SetLayoutAction,
	SetLayoutSuccessAction,
	SetMapsDataActionStore,
	SetPendingMapsCountAction
} from '../actions/map.actions';

describe('MapEffects', () => {
	let mapEffects: MapEffects;
	let actions: Observable<any>;
	let store: Store<any>;
	let imageryCommunicatorService: ImageryCommunicatorService;
	let mapFacadeService: MapFacadeService;
	let mapState: IMapState = cloneDeep(initialMapState);

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({ [mapFeatureKey]: MapReducer })
			],
			providers: [
				MapEffects,
				MapFacadeService,
				provideMockActions(() => actions),
				ImageryCommunicatorService
			]
		}).compileComponents();
	}));

	beforeEach(inject([Store, MapFacadeService], (_store: Store<any>, _mapFacadeService: MapFacadeService) => {
		store = _store;
		mapFacadeService = _mapFacadeService;
		const fakeStore = new Map<any, any>([
			[mapStateSelector, mapState]
		]);
		spyOn(store, 'select').and.callFake(type => Observable.of(fakeStore.get(type)));
	}));

	beforeEach(inject([MapEffects, ImageryCommunicatorService], (_mapEffects: MapEffects, _imageryCommunicatorService: ImageryCommunicatorService) => {
		mapEffects = _mapEffects;
		imageryCommunicatorService = _imageryCommunicatorService;
	}));

	it('should be defined', () => {
		expect(mapEffects).toBeDefined();
	});

	it('check that the action annotationContextMenuTrigger$ was triggerd', () => {

		const action = new AnnotationContextMenuTriggerAction((<any>{}));


		actions = hot('--a--', { a: action });
		const expectedResult = cold('--b--', { b: action });
		expect(mapEffects.annotationContextMenuTrigger$).toBeObservable(expectedResult);

	});

	describe('activeMapGeoRegistrationChanged$', () => {
		it('After active map is changed should dispatch "EnableMapGeoOptionsActionStore" geoOpertions state', () => {
			const testOverlay: Overlay = { id: 'testOverlayId1', isGeoRegistered: false } as Overlay;

			mapState.mapsList = <any> [
				{ id: 'imagery1', data: { overlay: testOverlay } },
				{ id: 'imagery2', data: { overlay: testOverlay } }
			];
			mapState.activeMapId = 'imagery1';
			const fakeCommunicator = { id: 'test' };
			spyOn(imageryCommunicatorService, 'provide').and.returnValue(fakeCommunicator);
			actions = hot('--a--', { a: new ActiveMapChangedAction('') });
			const expectedResults = cold('--b--', {
				b: new EnableMapGeoOptionsActionStore({
					mapId: 'imagery1',
					isEnabled: false
				})
			});
			expect(mapEffects.activeMapGeoRegistrationChanged$).toBeObservable(expectedResults);
		});
	});

	describe('onLayoutsChange$', () => {
		it('onLayoutsChange$ should call SetPendingMapsCountAction and SetMapsDataActionStore when more maps need to be created', () => {
			spyOn(mapFacadeService, 'setMapsDataChanges').and.returnValue({
				'mapsList': [],
				'activeMapId': 'imagery1'
			});

			mapState.mapsList = <any> [
				{ id: 'imagery1' },
				{ id: 'imagery2' }
			];

			mapState.activeMapId = 'imagery1';

			actions = hot('--a--', {
				a: new SetLayoutAction({
					'id': 'dfgdfg',
					'mapsCount': 3
				})
			});

			const expectedResults = cold('--(bc)--', {
				b: new SetPendingMapsCountAction(1),
				c: new SetMapsDataActionStore({ 'mapsList': [], 'activeMapId': 'imagery1' })
			});
			expect(mapEffects.onLayoutsChange$).toBeObservable(expectedResults);
		});
	});

	describe('onMapCreatedDecreasePendingCount$', () => {
		it('AddMapInstance should call DecreasePendingMapsCountAction', () => {
			mapState.pendingMapsCount = 1;

			actions = hot('--a--', {
				a: new AddMapInstanceAction({
					'currentCommunicatorId': '',
					'communicatorIds': ['']
				})
			});

			const expectedResults = cold('--b--', {
				b: new DecreasePendingMapsCountAction()
			});
			expect(mapEffects.onMapCreatedDecreasePendingCount$).toBeObservable(expectedResults);
		});

		it('RemoveMapInstanceAction should call DecreasePendingMapsCountAction', () => {
			mapState.pendingMapsCount = 1;

			actions = hot('--a--', { a: new RemoveMapInstanceAction({}) });

			const expectedResults = cold('--b--', {
				b: new DecreasePendingMapsCountAction()
			});
			expect(mapEffects.onMapCreatedDecreasePendingCount$).toBeObservable(expectedResults);
		});
	});

	describe('onMapPendingCountReachedZero$', () => {
		it('onMapPendingCountReachedZero$ should call SetLayoutSuccessAction', () => {
			mapState.pendingMapsCount = 0;

			actions = hot('--a--', { a: new DecreasePendingMapsCountAction() });

			const expectedResults = cold('--b--', {
				b: new SetLayoutSuccessAction()
			});
			expect(mapEffects.onMapPendingCountReachedZero$).toBeObservable(expectedResults);
		});
	});
});

