import { inject, TestBed } from '@angular/core/testing';
import { CacheService } from './cache.service';
import { ConfigurationToken } from '@ansyn/imagery/model/configuration.token';
import { ImageryCommunicatorService } from '@ansyn/imagery';

describe('CacheService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{
					provide: CacheService,
					useClass: CacheService,
					deps: [ConfigurationToken, ImageryCommunicatorService]
				},
				{
					provide: ConfigurationToken,
					useValue: {}
				},
				{
					provide: ImageryCommunicatorService,
					useValue: { communicatorsAsArray: () => [] }
				}
			]
		});
	});

	it('should be created', inject([CacheService], (service: CacheService) => {
		expect(service).toBeTruthy();
	}));
});
