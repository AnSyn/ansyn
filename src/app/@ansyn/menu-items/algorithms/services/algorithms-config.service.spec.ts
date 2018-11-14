import { inject, TestBed } from '@angular/core/testing';

import { AlgorithmsConfigService } from './algorithms-config.service';

describe('AlgorithmsConfigService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				AlgorithmsConfigService,
				{
					provide: 'algorithmsConfig',
					useValue: {}
				}
			]
		});
	});

	it('should be created', inject([AlgorithmsConfigService], (service: AlgorithmsConfigService) => {
		expect(service).toBeTruthy();
	}));
});
