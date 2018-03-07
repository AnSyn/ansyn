import { inject, TestBed } from '@angular/core/testing';

import { LoggerService } from './logger.service';
import { LoggerConfig } from '../models/logger.config';

describe('LoggerService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				LoggerService,
				{
					provide: LoggerConfig,
					useValue: {
						env: 'TEST',
						active: false
					}
				}
			]
		});
	});

	it('should be created', inject([LoggerService], (service: LoggerService) => {
		expect(service).toBeTruthy();
	}));
});
