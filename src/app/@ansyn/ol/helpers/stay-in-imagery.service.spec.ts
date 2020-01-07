import { TestBed } from '@angular/core/testing';

import { StayInImageryService } from './stay-in-imagery.service';

describe('StayInImageryService', () => {
	beforeEach(() => TestBed.configureTestingModule({
		providers: [StayInImageryService]
	}));

	it('should be created', () => {
		const service: StayInImageryService = TestBed.get(StayInImageryService);
		expect(service).toBeTruthy();
	});
});
