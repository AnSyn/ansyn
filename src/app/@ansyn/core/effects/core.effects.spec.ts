import { async, inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import { provideMockActions } from '@ngrx/effects/testing';
import { CoreEffects } from './core.effects';
import { LoggerService } from '../services/logger.service';
import { LoggerConfig } from '../models/logger.config';

describe('CoreEffects', () => {
	let coreEffects: CoreEffects;
	let actions: Observable<any>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({})
			],
			providers: [
				CoreEffects,
				LoggerService,
				{ provide: LoggerConfig, useValue: {} },
				provideMockActions(() => actions)
			]
		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
	}));

	beforeEach(inject([CoreEffects], (_coreEffects: CoreEffects) => {
		coreEffects = _coreEffects;
	}));

	it('should be defined', () => {
		expect(coreEffects).toBeDefined();
	});

});
