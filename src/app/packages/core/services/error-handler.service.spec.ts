import { inject, TestBed } from '@angular/core/testing';
import { ErrorHandlerService, LoggerService } from '@ansyn/core';
import { Store } from '@ngrx/store';

fdescribe('ErrorHandlerService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				ErrorHandlerService,
				{
					provide: Store,
					useValue: () => null
				},
				{
					provide: LoggerService,
					useValue: {}
				}
			]
		});
	});

	it('should be created', inject([ErrorHandlerService], (service: ErrorHandlerService) => {
		expect(service).toBeTruthy();
	}));
});
