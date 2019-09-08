import { inject, TestBed } from '@angular/core/testing';
import { Auth0Config, Auth0Service } from './auth0.service';
import { RouterTestingModule } from '@angular/router/testing';
import { IImisightOverlaySourceConfig, ImisightOverlaySourceConfig } from './imisight.model';

describe('Auth0Service', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [RouterTestingModule],
			providers: [
				Auth0Service,
				{
					provide: ImisightOverlaySourceConfig, useValue: <IImisightOverlaySourceConfig>{
						baseUrl: 'imisight.com',
					}
				},
				{
					provide: Auth0Config,
					useValue: {
						auth0Active: 'false',
						clientID: 'KXLTbs08LtLqrbPwSgn7Ioej0aMB7tf6',
						domain: 'imisight-sat.auth0.com',
						responseType: 'token id_token',
						audience: 'https://gw.sat.imisight.net',
						callbackURL: 'http://localhost:4200/#/callback/',
						scope: 'openid'
					}
				}
			]
		});
	});

	it('should be created', inject([Auth0Service], (service: Auth0Service) => {
		expect(service).toBeTruthy();
	}));
});
