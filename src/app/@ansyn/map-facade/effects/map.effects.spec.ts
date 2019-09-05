import { MapEffects } from './map.effects';
import { Observable, of } from 'rxjs';
import { Store, StoreModule } from '@ngrx/store';
import { async, inject, TestBed } from '@angular/core/testing';
import { IMapState, initialMapState, mapFeatureKey, MapReducer, mapStateSelector } from '../reducers/map.reducer';
import { provideMockActions } from '@ngrx/effects/testing';
import { ImageryCommunicatorService, IMapSettings } from '@ansyn/imagery';
import { MapFacadeService } from '../services/map-facade.service';
import { cloneDeep } from 'lodash';
import { cold, hot } from 'jasmine-marbles';
import {
	DecreasePendingMapsCountAction,
	ImageryCreatedAction,
	SetLayoutSuccessAction,
	SetMapPositionByRadiusAction,
	SetMapPositionByRectAction,
	SynchronizeMapsAction
} from '../actions/map.actions';
import { mapFacadeConfig } from '../models/map-facade.config';

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
				{ provide: mapFacadeConfig, useValue: {} },
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
		spyOn(store, 'select').and.callFake(type => of(fakeStore.get(type)));
	}));

	beforeEach(inject([MapEffects, ImageryCommunicatorService], (_mapEffects: MapEffects, _imageryCommunicatorService: ImageryCommunicatorService) => {
		mapEffects = _mapEffects;
		imageryCommunicatorService = _imageryCommunicatorService;
	}));

	it('should be defined', () => {
		expect(mapEffects).toBeDefined();
	});

	describe('onMapCreatedDecreasePendingCount$', () => {

		it('ImageryCreatedAction should call DecreasePendingMapsCountAction', () => {
			mapState.pendingMapsCount = 1;

			actions = hot('--a--', { a: new ImageryCreatedAction({ id: 'id' }) });

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

	describe('onSynchronizeAppMaps$', () => {
		it('listen to SynchronizeMapsAction', () => {
			const communicator = {
				setPosition: () => {
					return of(true);
				},
				getPosition: () => {
					return of({});
				}
			};
			const fakeMap: IMapSettings = <any>{ id: 'imagery2' };
			mapState.entities = { [fakeMap.id]: fakeMap };
			spyOn(imageryCommunicatorService, 'provide').and.callFake(() => communicator);
			spyOn(communicator, 'getPosition').and.callFake(() => of(true));
			spyOn(mapEffects, 'setPosition').and.callFake(() => of(true));
			const action = new SynchronizeMapsAction({ mapId: 'imagery1' });
			actions = hot('--a--', { a: action });
			const expectedResults = cold('--b--', { b: [action, mapState] });
			expect(mapEffects.onSynchronizeAppMaps$).toBeObservable(expectedResults);
			expect(mapEffects.setPosition).toHaveBeenCalled();
		});
	});

	describe('setMapPositionByRect$', () => {
		it('setMapPositionByRect$ should call communicator.setPositionByRect', () => {
			spyOn(imageryCommunicatorService, 'provide').and.returnValue({
				setPositionByRect: () => of('345')
			});
			actions = hot('--a--', { a: new SetMapPositionByRectAction({ id: '234', rect: null }) });

			const expectedResults = cold('--b--', {
				b: '345'
			});
			expect(mapEffects.setMapPositionByRect$).toBeObservable(expectedResults);
		});
		it('setMapPositionByRect$ should work if there is no communicator', () => {
			spyOn(imageryCommunicatorService, 'provide').and.returnValue(null);
			actions = hot('--a--', { a: new SetMapPositionByRectAction({ id: '234', rect: null }) });

			const expectedResults = cold('-----');
			expect(mapEffects.setMapPositionByRect$).toBeObservable(expectedResults);
		});
	});

	describe('setMapPositionByRadius$', () => {
		it('setMapPositionByRadius$ should call communicator.setPositionByRect', () => {
			spyOn(imageryCommunicatorService, 'provide').and.returnValue({
				setPositionByRadius: () => of('456')
			});
			actions = hot('--a--', {
				a: new SetMapPositionByRadiusAction({
					id: '234',
					center: null,
					radiusInMeters: 100
				})
			});

			const expectedResults = cold('--b--', {
				b: '456'
			});
			expect(mapEffects.setMapPositionByRadius$).toBeObservable(expectedResults);
		});
		it('setMapPositionByRadius$ should work if there is no communicator', () => {
			spyOn(imageryCommunicatorService, 'provide').and.returnValue(null);
			actions = hot('--a--', {
				a: new SetMapPositionByRadiusAction({
					id: '234',
					center: null,
					radiusInMeters: 100
				})
			});

			const expectedResults = cold('-----');
			expect(mapEffects.setMapPositionByRadius$).toBeObservable(expectedResults);
		});
	});

});

