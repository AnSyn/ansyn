import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { credentialsConfig, ICredentialsConfig } from './config';
import { map } from 'rxjs/operators';

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
		this.httpClient.get(url);
		return this.httpClient.get(url + '?' + 'hi', options)
			.pipe(map((data: any) => {
				data ? this.credentials = data : this.credentials = this.config.noCredentialsMessage;
			}));
	}
}
