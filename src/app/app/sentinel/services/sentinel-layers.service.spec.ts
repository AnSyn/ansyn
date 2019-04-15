import { TestBed } from '@angular/core/testing';

import { SentinelLayersService } from './sentinel-layers.service';

describe('SentinelLayersService', () => {
	beforeEach(() => TestBed.configureTestingModule({}));

	it('should be created', () => {
		const service: SentinelLayersService = TestBed.get(SentinelLayersService);
		expect(service).toBeTruthy();
	});
});
