import { TestBed } from '@angular/core/testing';

import { StayInImageryService } from './stay-in-imagery.service';
import { IMAGERY_CONFIG } from '../model/configuration.token';

describe('StayInImageryService', () => {
	beforeEach(() => TestBed.configureTestingModule({
		providers: [
			StayInImageryService,
			{
				provide: IMAGERY_CONFIG,
				useValue: {}
			}
		]
	}));

	it('should be created', () => {
		const service: StayInImageryService = TestBed.get(StayInImageryService);
		expect(service).toBeTruthy();
	});
});
