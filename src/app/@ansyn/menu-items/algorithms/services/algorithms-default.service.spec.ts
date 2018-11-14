import { inject, TestBed } from '@angular/core/testing';

import { AlgorithmsDefaultService } from './algorithms-default.service';

describe('AlgorithmsDefaultService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [AlgorithmsDefaultService]
		});
	});

	it('should be created', inject([AlgorithmsDefaultService], (service: AlgorithmsDefaultService) => {
		expect(service).toBeTruthy();
	}));
});
