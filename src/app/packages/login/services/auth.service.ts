import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ILoginConfig } from '../models/login.config';

export const LoginConfig: InjectionToken<ILoginConfig> = new InjectionToken('LoginConfig');

@Injectable()
export class AuthService{

	constructor(private httpClient: HttpClient, @Inject(LoginConfig) private config: ILoginConfig){}

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
		if (!this.config.active) {
			return Observable.of(true);
		}
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
