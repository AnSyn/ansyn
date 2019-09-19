import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { credentialsConfig, ICredentialsConfig } from './config';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class CredentialsService {
	credentials: string;


	constructor(protected httpClient: HttpClient,
				@Inject(credentialsConfig) public config: ICredentialsConfig) {
		this.credentials = config.noCredentialsMessage;
	}

	getCredentials() {
		const url = `${ this.config.baseUrl }`;
		const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
		const options = { headers };
		return this.httpClient.get(url + '?' + 'hi', options)
			.pipe(
				map((data: any) => {
					this.credentials = data ? data : this.config.noCredentialsMessage;
				}),
				catchError((err) => {
					this.credentials = this.config.noCredentialsMessage;
					return of(true);
				}));
	}
}
