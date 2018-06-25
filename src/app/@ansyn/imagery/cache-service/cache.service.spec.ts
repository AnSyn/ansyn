import { inject, TestBed } from '@angular/core/testing';
import { CacheService } from './cache.service';
import { IMAGERY_CONFIG } from '../model/configuration.token';
import { ImageryCommunicatorService } from '../communicator-service/communicator.service';

describe('CacheService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{
					provide: CacheService,
					useClass: CacheService,
					deps: [IMAGERY_CONFIG, ImageryCommunicatorService]
				},
				{
					provide: IMAGERY_CONFIG,
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
