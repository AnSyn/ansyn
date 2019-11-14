import { inject, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { ErrorHandlerService } from './error-handler.service';
import { LoggerService } from './logger.service';
import { SetToastMessageAction } from '@ansyn/map-facade';
import { catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs/index';
import { CoreConfig } from '../models/core.config';

describe('ErrorHandlerService', () => {
	let service: ErrorHandlerService;
	let store: Store<any>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{
					provide: CoreConfig,
					useValue: {}
				},
				ErrorHandlerService,
				{
					provide: Store,
					useValue: {
						dispatch: () => {
						}
					}
				},
				{
					provide: LoggerService,
					useValue: {
						error: () => {
						}
					}
				}
			]
		});
	});

	beforeEach(inject([ErrorHandlerService, Store], (_service: ErrorHandlerService, _store: Store<any>) => {
		service = _service;
		store = _store;
	}));

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('httpErrorHandle()', () => {
		const message = 'wow wow wow!';
		const toastMessage = 'ho ho ho!';
		beforeEach(() => {
			spyOn(service.loggerService, 'error');
			spyOn(store, 'dispatch');
		});
		it('should be defined', () => {
			expect(service.httpErrorHandle).toBeTruthy();
		});
		it('should get an error, and pass it to loggerService', () => {
			service.httpErrorHandle(new Error(message));
			expect(service.loggerService.error).toHaveBeenCalledWith(message, 'network');
		});
		it('should pass the given toast message via store action', () => {
			service.httpErrorHandle(new Error(message), toastMessage);
			expect(store.dispatch).toHaveBeenCalledWith(new SetToastMessageAction({
				toastText: toastMessage,
				showWarningIcon: true
			}));
		});
		it('if the returnValue param is undefined, throw observable error', (done) => {
			const testResult = 'wow';
			const result$ = service.httpErrorHandle(new Error(message), toastMessage);
			const use$: Observable<string> = result$.pipe(
				catchError(() => of(testResult))
			);
			use$.subscribe((result) => {
				expect(result).toEqual(testResult);
				done();
			});
		});
		it('if the returnValue param is null, return observable null', (done) => {
			const result$ = service.httpErrorHandle(new Error(message), toastMessage, null);
			result$.subscribe((result) => {
				expect(result).toEqual(null);
				done();
			});
		});
		it('if the returnValue param is truthy, return observable with that value', (done) => {
			const value = 'ho ho ho';
			const result$ = service.httpErrorHandle(new Error(message), toastMessage, value);
			result$.subscribe((result) => {
				expect(result).toEqual(value);
				done();
			});
		});
	});
});
