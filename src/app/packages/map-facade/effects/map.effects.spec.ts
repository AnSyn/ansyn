import { MapEffects } from './map.effects';
import { Observable } from 'rxjs/Observable';
import { Store, StoreModule } from '@ngrx/store';
import { async, inject, TestBed } from '@angular/core/testing';
import { IMapState, initialMapState, mapFeatureKey, MapReducer, mapStateSelector } from '../reducers/map.reducer';
import { provideMockActions } from '@ngrx/effects/testing';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { MapFacadeService } from '../services/map-facade.service';
import { cloneDeep } from 'lodash';
import { Overlay } from '../../core/models/overlay.model';
import { cold, hot } from 'jasmine-marbles';
import { ActiveMapChangedAction, EnableMapGeoOptionsActionStore } from '../actions/map.actions';

describe('MapEffects', () => {
	let mapEffects: MapEffects;
	let actions: Observable<any>;
	let store: Store<any>;
	let imageryCommunicatorService: ImageryCommunicatorService;
	let mapState: IMapState = cloneDeep(initialMapState);

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({ [mapFeatureKey]: MapReducer }),
			],
			providers: [
				MapEffects,
				MapFacadeService,
				provideMockActions(() => actions),
				ImageryCommunicatorService
			]
		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
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


	describe('activeMapGeoRegistrationChanged$', () => {
		it('After active map is changed should dispatch "EnableMapGeoOptionsActionStore" geoOpertions state', () => {
			const testOverlay: Overlay = { id: 'testOverlayId1', isGeoRegistered: false } as Overlay;

			mapState.mapsList = <any> [
				{ id: 'imagery1', data: { overlay: testOverlay } },
				{ id: 'imagery2', data: { overlay: testOverlay } },
			];
			mapState.activeMapId = 'imagery1';
			const fakeCommuincator = { id: 'test' };
			spyOn(imageryCommunicatorService, 'provide').and.returnValue(fakeCommuincator);
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
});

