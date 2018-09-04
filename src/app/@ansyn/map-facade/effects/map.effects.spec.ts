import { MapEffects } from './map.effects';
import { Observable, of } from 'rxjs';
import { Store, StoreModule } from '@ngrx/store';
import { async, inject, TestBed } from '@angular/core/testing';
import { IMapState, initialMapState, mapFeatureKey, MapReducer, mapStateSelector } from '../reducers/map.reducer';
import { provideMockActions } from '@ngrx/effects/testing';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { MapFacadeService } from '../services/map-facade.service';
import { cloneDeep } from 'lodash';
import { cold, hot } from 'jasmine-marbles';
import {
	AnnotationSelectAction,
	DecreasePendingMapsCountAction,
	ImageryRemovedAction
} from '../actions/map.actions';
import { SynchronizeMapsAction } from '@ansyn/map-facade/actions/map.actions';
import { SetLayoutSuccessAction } from '@ansyn/core/actions/core.actions';
import { ICaseMapState } from '@ansyn/core/models/case.model';

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
		spyOn(store, 'select').and.callFake(type => of(fakeStore.get(type)));
	}));

	beforeEach(inject([MapEffects, ImageryCommunicatorService], (_mapEffects: MapEffects, _imageryCommunicatorService: ImageryCommunicatorService) => {
		mapEffects = _mapEffects;
		imageryCommunicatorService = _imageryCommunicatorService;
	}));

	it('should be defined', () => {
		expect(mapEffects).toBeDefined();
	});

	it('check that the action annotationContextMenuTrigger$ was triggerd', () => {

		const action = new AnnotationSelectAction((<any>{}));


		actions = hot('--a--', { a: action });
		const expectedResult = cold('--b--', { b: action });
		expect(mapEffects.annotationContextMenuTrigger$).toBeObservable(expectedResult);

	});

	describe('onMapCreatedDecreasePendingCount$', () => {

		it('ImageryRemovedAction should call DecreasePendingMapsCountAction', () => {
			mapState.pendingMapsCount = 1;

			actions = hot('--a--', { a: new ImageryRemovedAction({ id: 'id' }) });

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
			const fakeMap: ICaseMapState = <any> {id: 'imagery2'};
			mapState.mapsList = [fakeMap];
			spyOn(imageryCommunicatorService, 'provide').and.callFake(() => communicator);
			spyOn(communicator, 'setPosition').and.callFake(() => of(true));
			const action = new SynchronizeMapsAction({ mapId: 'imagery1' });
			actions = hot('--a--', { a: action });
			const expectedResults = cold('--b--', { b: [action, mapState] });
			expect(mapEffects.onSynchronizeAppMaps$).toBeObservable(expectedResults);
			expect(communicator.setPosition).toHaveBeenCalled();
		});
	});
});

