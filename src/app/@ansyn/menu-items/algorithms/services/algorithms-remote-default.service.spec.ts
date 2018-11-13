import { inject, TestBed } from '@angular/core/testing';

import { AlgorithmsRemoteDefaultService } from './algorithms-remote-default.service';

describe('AlgorithmsRemoteDefaultService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [AlgorithmsRemoteDefaultService]
		});
	});

	it('should be created', inject([AlgorithmsRemoteDefaultService], (service: AlgorithmsRemoteDefaultService) => {
		expect(service).toBeTruthy();
	}));
});
