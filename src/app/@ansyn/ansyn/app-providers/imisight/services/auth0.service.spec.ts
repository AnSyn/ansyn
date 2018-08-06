import { inject, TestBed } from '@angular/core/testing';

import { Auth0Service } from './auth0.service';

describe('Auth0Service', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [Auth0Service]
		});
	});

	it('should be created', inject([Auth0Service], (service: Auth0Service) => {
		expect(service).toBeTruthy();
	}));
});
