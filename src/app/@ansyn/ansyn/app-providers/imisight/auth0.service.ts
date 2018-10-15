import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as auth0 from 'auth0-js';
import { Auth0Config, IAuth0Config } from './auth0.model';

@Injectable({
	providedIn: 'root'
})
export class Auth0Service {
	auth0 = new auth0.WebAuth({
		clientID: this.auth0Config.clientID,
		domain: this.auth0Config.domain,
		responseType: this.auth0Config.responseType,
		audience: this.auth0Config.audience,
		redirectUri: this.auth0Config.callbackURL,
		scope: this.auth0Config.scope
	});

	public get auth0Active(): boolean {
		return this.auth0Config.auth0Active;
	}

	constructor(public router: Router, @Inject(Auth0Config) protected auth0Config: IAuth0Config) {
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
