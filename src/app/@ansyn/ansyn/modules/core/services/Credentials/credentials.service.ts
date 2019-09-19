import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { CredentialsConfig, ICredentialsConfig } from "./config";
import { map } from "rxjs/operators";

@Injectable({
	providedIn: 'root'
})
export class CredentialsService {
	credentials = this.config.noCredentialsMessage;


	constructor(protected httpClient: HttpClient,
				@Inject(CredentialsConfig) public config: ICredentialsConfig) {
	}

	getCredentials(username: string) {
		const url = `${this.config.baseUrl}`;
		const headers = new HttpHeaders({'Content-Type': 'application/json'});
		const options = {headers};
		this.httpClient.get(url);
		return this.httpClient.get(url + "?" + username, options)
			.pipe(map((data: any) => {
				data ? this.credentials = data : this.credentials = this.config.noCredentialsMessage;
			}));
	}
}
