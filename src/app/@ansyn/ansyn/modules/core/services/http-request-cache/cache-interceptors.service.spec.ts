import { TestBed } from '@angular/core/testing';

import { CacheInterceptorsService } from './cache-interceptors.service';
import { CacheRequestService } from './cache-request.service';

describe('CacheInterceptorsService', () => {
	let service: CacheInterceptorsService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{
					provide: CacheRequestService,
					useValue: {
						get: () => {},
						set: () => {}
					}
				}
			]
		});
		service = TestBed.inject(CacheInterceptorsService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
