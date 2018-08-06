import { Injectable } from '@angular/core';
// import { AUTH_CONFIG } from './auth0-variables';
import { Router } from '@angular/router';
import * as auth0 from 'auth0-js';

interface IAuthConfig {
	clientID: string;
	domain: string;
	responseType: string;
	audience: string;
	callbackURL: string;
	scope: string;
}

export const AUTH_CONFIG: IAuthConfig = {
	clientID: 'KXLTbs08LtLqrbPwSgn7Ioej0aMB7tf6',
	domain: 'imisight-sat.auth0.com',
	responseType: 'token id_token',
	audience: 'https://gw.sat.imisight.net',
	callbackURL: 'http://localhost:4200/#/callback/',
	scope: 'openid'
};

(window as any).global = window;

@Injectable()
export class Auth0Service {
	auth0 = new auth0.WebAuth({
		clientID: AUTH_CONFIG.clientID,
		domain: AUTH_CONFIG.domain,
		responseType: AUTH_CONFIG.responseType,
		audience: AUTH_CONFIG.audience,
		redirectUri: AUTH_CONFIG.callbackURL,
		scope: AUTH_CONFIG.scope
	});

	constructor(public router: Router) {
	}

	public login(): void {
		this.auth0.authorize();
	}

	get access_token() {
		return localStorage.getItem('access_token');
	}

	public handleAuthentication(): void {
		this.auth0.parseHash((err, authResult) => {
			if (authResult && authResult.accessToken && authResult.idToken) {
				this.setSession(authResult);
				this.router.navigate(['']);
			} else if (err) {
				this.router.navigate(['']);
				alert(`Error: ${err.error}. Check the console for further details.`);
			}
		});
	}

	isValidToken() {
		const token = this.access_token;
		const expiresAteTime = new Date(Number(localStorage.getItem('expires_at') || 0));
		const now = new Date();
		return token && now < expiresAteTime;
	}

	private setSession(authResult): void {
		// Set the time that the access token will expire at
		const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
		localStorage.setItem('access_token', authResult.accessToken);
		localStorage.setItem('id_token', authResult.idToken);
		localStorage.setItem('expires_at', expiresAt);
	}
}
