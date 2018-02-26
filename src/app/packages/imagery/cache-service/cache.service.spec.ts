import { inject, TestBed } from '@angular/core/testing';
import { CacheService } from './cache.service';
import { ConfigurationToken } from '@ansyn/imagery/configuration.token';

describe('CacheService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				CacheService,
				{
					provide: ConfigurationToken,
					useValue: {}
				}
			]
		});
	});

	it('should be created', inject([CacheService], (service: CacheService) => {
		expect(service).toBeTruthy();
	}));
});
