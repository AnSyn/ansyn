import { TestBed } from '@angular/core/testing';

import { AreaToCredentialsService } from './area-to-credentials.service';
import { HttpClientModule } from '@angular/common/http';
import { credentialsConfig } from './config';

describe('AreaToCredentialsService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientModule],
			providers: [
				AreaToCredentialsService,
				{
					provide: credentialsConfig,
					useValue: {
					}
				}
			]
		});
	});

	it('should be created', () => {
		const service: AreaToCredentialsService = TestBed.get(AreaToCredentialsService);
		expect(service).toBeTruthy();
	});
});
