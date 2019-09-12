import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { CredentialsConfigService, ICredentialsConfig } from "./config";
import { map } from "rxjs/operators";

@Injectable({
	providedIn: 'root'
})
export class CredentialsService {
	credentials = "you have no credentials";

	get config(): ICredentialsConfig {
		return this.credentialsConfig.config;
	}
	constructor(protected httpClient: HttpClient, protected credentialsConfig: CredentialsConfigService) {
	}

	getCredentials(username: string) {
		const url = `${ this.config.baseUrl }`;
		const body = JSON.stringify({ username });
		const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
		const options = { headers };
		return this.httpClient
			.post(url, body, options)
			.pipe(map((data: string) => {data ? this.credentials = data : this.credentials = "you have no credentials"}));
	}
}
