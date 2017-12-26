import { async, inject, TestBed } from '@angular/core/testing';

import { Store, StoreModule } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { NorthAppEffects } from './north.app.effects';
import { CalcNorthDirectionAction, PointNorthAction, UpdateNorthAngleAction } from '@ansyn/map-facade';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { CaseMapState, Overlay } from '@ansyn/core';

describe('NorthAppEffects', () => {
	let northAppEffects: NorthAppEffects;
	let store: Store<any>;
	let actions: Observable<any>;
	let imageryCommunicatorService: ImageryCommunicatorService = null;

	let fakePlugin;
	let fakeCommunicator;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({})
			],
			providers: [
				provideMockActions(() => actions),
				NorthAppEffects,
				ImageryCommunicatorService
			]

		}).compileComponents();
	}));

	beforeEach(inject([Store, NorthAppEffects, ImageryCommunicatorService], (_store: Store<any>, _northAppEffects: NorthAppEffects, _imageryCommunicatorService: ImageryCommunicatorService) => {
		store = _store;
		northAppEffects = _northAppEffects;
		imageryCommunicatorService = _imageryCommunicatorService;
	}));

	beforeEach(() => {
		fakePlugin = {
			setCorrectedNorth: () => {
			},
			getCorrectedNorthOnce: () => {
			}
		};

		fakeCommunicator = {
			setRotation: () => {
			},
			getPlugin: () => {
			},
			ActiveMap: {
				mapObject: {}
			}
		};

		spyOn(imageryCommunicatorService, 'provide').and.callFake((id) => fakeCommunicator);
		spyOn(fakeCommunicator, 'setRotation');
		spyOn(fakeCommunicator, 'getPlugin').and.callFake((id) => fakePlugin);
		spyOn(fakePlugin, 'setCorrectedNorth');

		// This doesn't work so we overrided the  Observable.fromPromise
		spyOn(fakePlugin, 'getCorrectedNorthOnce').and.callFake(() => Promise.resolve({ northOffsetRad: -1 }));
		spyOn(Observable, 'fromPromise').and.callFake(() => Observable.of({ northOffsetRad: -1 }));
	});

	it('pointNorth$ with "ImageAngle" should call commEntity.setRotation with overlay rotation', () => {
		const overlay = <Overlay>{ azimuth: 100 };
		actions = hot('--a--', {
			a: new PointNorthAction({
				mapId: 'fakeId',
				rotationType: 'ImageAngle',
				overlay: overlay
			})
		});
		const expectedResults = cold('--b--', { b: undefined });
		expect(northAppEffects.pointNorth$).toBeObservable(expectedResults);
		expect(fakeCommunicator.setRotation).toHaveBeenCalledWith(100);
	});

	it('pointNorth$ with "ImageAngle" of null overlay should call commEntity.setRotation with rotation 0', () => {
		actions = hot('--a--', { a: new PointNorthAction({ mapId: 'fakeId', rotationType: 'ImageAngle' }) });
		const expectedResults = cold('--b--', { b: undefined });
		expect(northAppEffects.pointNorth$).toBeObservable(expectedResults);
		expect(fakeCommunicator.setRotation).toHaveBeenCalledWith(0);
	});

	it('pointNorth$ with "North" of null overlay should call commEntity.setRotation with rotation 0', () => {
		actions = hot('--a--', { a: new PointNorthAction({ mapId: 'fakeId', rotationType: 'North' }) });
		const expectedResults = cold('--b--', { b: undefined });
		expect(northAppEffects.pointNorth$).toBeObservable(expectedResults);
		expect(fakeCommunicator.setRotation).toHaveBeenCalledWith(0);
	});

	it('pointNorth$ with "North" with overlay should call northPlugin.setCorrectedNorth method', () => {
		const overlay = <Overlay>{ azimuth: 100 };
		actions = hot('--a--', {
			a: new PointNorthAction({
				mapId: 'fakeId',
				rotationType: 'North',
				overlay: overlay
			})
		});
		const expectedResults = cold('--b--', { b: undefined });
		expect(northAppEffects.pointNorth$).toBeObservable(expectedResults);
		expect(fakePlugin.setCorrectedNorth).toHaveBeenCalled();
	});

	it('calcNorthAngleForWorldView$ with null overlay should raise UpdateNorthAngleAction method', () => {
		const fakeMapState = <CaseMapState>{
			id: 'fakeId',
			data: {
				position: {
					projectedState: {
						rotation: 10
					}
				}
			}
		};

		actions = hot('--a--', { a: new CalcNorthDirectionAction({ mapId: 'fakeId', mapState: fakeMapState }) });
		const expectedResults = cold('--b--', { b: new UpdateNorthAngleAction({ mapId: 'fakeId', angleRad: 10 }) });
		expect(northAppEffects.calcNorthAngleForWorldView$).toBeObservable(expectedResults);
	});

	it('calcNorthAngleForOverlay$ with overlay should call northPlugin.getCorrectedNorthOnce and raise UpdateNorthAngleAction method', () => {
		const overlay = <Overlay>{ azimuth: 100 };
		const fakeMapState = <CaseMapState>{
			id: 'fakeId',
			data: {
				overlay: overlay
			}
		};

		actions = hot('--a--', { a: new CalcNorthDirectionAction({ mapId: 'fakeId', mapState: fakeMapState }) });
		const expectedResults = cold('--b--', { b: new UpdateNorthAngleAction({ mapId: 'fakeId', angleRad: 1 }) });
		expect(northAppEffects.calcNorthAngleForOverlay$).toBeObservable(expectedResults);
	});
});
