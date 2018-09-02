import { InjectionToken } from '@angular/core';

export const Auth0Config: InjectionToken<IAuth0Config> = new InjectionToken('auth0-config');

export interface IAuth0Config {
	clientID: string;
	domain: string;
	responseType: string;
	audience: string;
	callbackURL: string;
	scope: string;

}
