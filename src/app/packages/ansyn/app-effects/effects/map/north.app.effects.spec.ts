import { async, inject, TestBed } from '@angular/core/testing';

import { Store, StoreModule } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { NorthAppEffects } from './north.app.effects';
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
});
