import { inject, TestBed } from '@angular/core/testing';

import { AlgorithmsService } from './algorithms.service';

describe('AlgorithmsService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				AlgorithmsService,
				{
					provide: 'algorithmsConfig',
					useValue: {}
				}
			]
		});
	});

	it('should be created', inject([AlgorithmsService], (service: AlgorithmsService) => {
		expect(service).toBeTruthy();
	}));
});
