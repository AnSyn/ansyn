import { LoggerAppEffects } from './logger.app.effects';
import { inject, TestBed, waitForAsync } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { LoggerService } from '../../modules/core/services/logger.service';
import { Actions } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';

describe('LoggerAppEffects', () => {
	let loggerAppEffects: LoggerAppEffects;
	let loggerService: LoggerService;
	let actions$: Actions;

	beforeEach(waitForAsync( () => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({})
			],
			providers: [
				LoggerAppEffects,
				provideMockActions(() => actions$),
				{ provide: LoggerService, useValue: {} }
			]
		}).compileComponents();
	}));

	beforeEach(inject([LoggerAppEffects, Actions, LoggerService], (_loggerAppEffects, _actions, _loggerService) => {
		loggerAppEffects = _loggerAppEffects;
		loggerService = _loggerService;
		actions$ = _actions;
	}));

	it('should instantiate', () => {
		expect(loggerAppEffects).toBeTruthy();
	})
});
