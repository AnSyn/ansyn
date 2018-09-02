import { inject, TestBed } from '@angular/core/testing';
import { Auth0Service } from './auth0.service';
import { RouterTestingModule } from '@angular/router/testing';
import {
	IImisightOverlaySourceConfig,
	ImisightOverlaySourceConfig
} from '@ansyn/ansyn/app-providers/imisight/imisight.model';

describe('Auth0Service', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [RouterTestingModule],
			providers: [
				Auth0Service,
				{
					provide: ImisightOverlaySourceConfig, useValue: <IImisightOverlaySourceConfig> {
					baseUrl: 'imisight.com',
					callbackURL: 'callback'
					}
				}
			]
		});
	});

	it('should be created', inject([Auth0Service], (service: Auth0Service) => {
		expect(service).toBeTruthy();
	}));
});
