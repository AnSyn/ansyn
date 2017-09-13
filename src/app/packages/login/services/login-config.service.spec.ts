import { inject, TestBed } from '@angular/core/testing';
import { LoginConfig, LoginConfigService } from './login-config.service';

describe('LoginConfigService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				LoginConfigService,
				{
					provide: LoginConfig,
					useValue: {}
				}
			]
		});
	});

	it('should be created', inject([LoginConfigService], (service: LoginConfigService) => {
		expect(service).toBeTruthy();
	}));
});
