import { inject, TestBed } from '@angular/core/testing';

import { CoreService } from './core.service';

describe('CoreService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [CoreService]
		});
	});

	it('should be created', inject([CoreService], (service: CoreService) => {
		expect(service).toBeTruthy();
	}));
});
