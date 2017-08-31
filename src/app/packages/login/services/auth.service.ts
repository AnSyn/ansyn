import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import hmacSHA256 from 'crypto-js/hmac-sha256';
import Base64 from 'crypto-js/enc-base64';
import Utf8 from 'crypto-js/enc-utf8';
import { AnsynJwt } from '../ansyn-jwt.class';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ILoginConfig } from '../models/login.config';
import { RequestOptions, Headers } from '@angular/http';

const roles = {
	ADMIN: Symbol('admin'),
	GUEST: Symbol('guest'),
	USER: Symbol('user')
};

export const LoginConfig: InjectionToken<ILoginConfig> = new InjectionToken('LoginConfig');

@Injectable()
export class AuthService{
	public ansynJwt: AnsynJwt;

	constructor(private httpClient: HttpClient, @Inject(LoginConfig) private config: ILoginConfig){
		this.ansynJwt = new AnsynJwt(Base64,Utf8,hmacSHA256);
	}

	logout(){
		this.clear();
	}

	setTokenStorage({authToken}){
		sessionStorage.setItem('authToken', authToken);
		localStorage.setItem('authToken', authToken);
	}

	setTokenSession({authToken}){
		sessionStorage.setItem('authToken', authToken);
	}

	login(username: string, password: string, rememberMe: boolean): any {
		const url = `${this.config.baseUrl}`;
		const body = JSON.stringify({username, password});
		const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
		const options = {headers};
		const whatToDo = rememberMe ? this.setTokenStorage : this.setTokenSession;
		return this.httpClient
			.post(url, body, options)
			.do(whatToDo)
	}

	loginAuth(authToken: string) {
		const url = `${this.config.baseUrl}/authToken`;
		const body = JSON.stringify({authToken});
		const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
		const options = {headers};
		return this.httpClient.post(url, body, options)
	}

	isLoggedIn() {
		const token = this.sessionToken ? this.sessionToken : this.localToken;
		if (!token) {
			return Observable.throw(401);
		}
		return this.loginAuth(token)
	}

	get localToken() {
		return localStorage.getItem('authToken')
	}

	get sessionToken() {
		return sessionStorage.getItem('authToken')
	}

	clear() {
		localStorage.removeItem('autoToken');
		sessionStorage.removeItem('autoToken');
	}
}


// if(!token){
// 	return false;
// }
// if(this.ansynJwt.check(token)){
// 	const payload = this.ansynJwt.getPayload(token);
// 	if(payload.exp > Date.now()){
// 		return payload;
// 	}
// 	return false;
// }
// return false;
