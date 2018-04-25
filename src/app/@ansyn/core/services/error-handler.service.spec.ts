import { inject, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { ErrorHandlerService } from '@ansyn/core/services/error-handler.service';
import { LoggerService } from '@ansyn/core/services/logger.service';

describe('ErrorHandlerService', () => {
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
