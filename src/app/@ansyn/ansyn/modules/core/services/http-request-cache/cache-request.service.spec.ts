import { TestBed } from '@angular/core/testing';

import { CacheRequestService } from './cache-request.service';

describe('CacheRequestService', () => {
	let service: CacheRequestService;
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [CacheRequestService]
		});
		service = TestBed.inject(CacheRequestService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});


});
