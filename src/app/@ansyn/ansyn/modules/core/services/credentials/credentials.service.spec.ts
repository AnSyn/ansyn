import { TestBed } from '@angular/core/testing';

import { CredentialsService } from './credentials.service';
import { HttpClientModule } from '@angular/common/http';
import { credentialsConfig } from './config';

describe('CredentialsService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientModule],
			providers: [
				{
					provide: credentialsConfig,
					useValue: {
						noCredentialsMessage: 'TEST'
					}
				}
			]
		});
	});

	it('should be created', () => {
		const service: CredentialsService = TestBed.get(CredentialsService);
		expect(service).toBeTruthy();
	});
});
