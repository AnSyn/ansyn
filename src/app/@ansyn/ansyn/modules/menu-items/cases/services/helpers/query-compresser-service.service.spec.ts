import { TestBed } from '@angular/core/testing';

import { QueryCompressorService } from './query-compresser-service.service';

describe('QueryCompresserService', () => {
	beforeEach(() => TestBed.configureTestingModule({}));

	it('should be created', () => {
		const service: QueryCompressorService = TestBed.get(QueryCompressorService);
		expect(service).toBeTruthy();
	});
});
