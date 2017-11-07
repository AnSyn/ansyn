import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginConfigService } from './login-config.service';
import { ILoginConfig } from '../models/login.config';
import 'rxjs/add/operator/do';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

@Injectable()
export class AuthService {

	get config(): ILoginConfig {
		return this.loginConfigService.config;
	}

	get authorizedPath(): string {
		return this.config.authorizedPath;
	}

	constructor(private httpClient: HttpClient, private loginConfigService: LoginConfigService) {
	}

	logout() {
		this.clear();
	}

	setTokenStorage({ authToken }) {
		sessionStorage.setItem('authToken', authToken);
		localStorage.setItem('authToken', authToken);
	}

	setTokenSession({ authToken }) {
		sessionStorage.setItem('authToken', authToken);
	}

	login(username: string, password: string, rememberMe: boolean): any {
		const url = `${this.config.baseUrl}`;
		const body = JSON.stringify({ username, password });
		const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
		const options = { headers };
		const whatToDo = rememberMe ? this.setTokenStorage : this.setTokenSession;
		return this.httpClient
			.post(url, body, options)
			.do(whatToDo);
	}

	loginAuth(authToken: string) {
		const url = `${this.config.baseUrl}/authToken`;
		const body = JSON.stringify({ authToken });
		const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
		const options = { headers };
		return this.httpClient.post(url, body, options);
	}

	isLoggedIn(): Observable<any> | ErrorObservable {
		if (!this.config.active) {
			return Observable.of(true);
		}
		const token = this.sessionToken ? this.sessionToken : this.localToken;
		if (!token) {
			return Observable.throw(401);
		}
		return this.loginAuth(token);
	}

	get localToken() {
		return localStorage.getItem('authToken');
	}

	get sessionToken() {
		return sessionStorage.getItem('authToken');
	}

	clear() {
		localStorage.removeItem('autoToken');
		sessionStorage.removeItem('autoToken');
	}
}
