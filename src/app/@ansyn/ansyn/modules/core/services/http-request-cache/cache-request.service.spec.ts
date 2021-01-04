import { TestBed } from '@angular/core/testing';

import { CacheRequestService } from './cache-request.service';
import { CoreConfig } from '../../models/core.config';

describe('CacheRequestService', () => {
	let service: CacheRequestService;
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [CacheRequestService,
				{
					provide: CoreConfig,
					useValue: {
						httpCacheBlackList: []
					}
				}]
		});
		service = TestBed.inject(CacheRequestService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});


});
