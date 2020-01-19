import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { credentialsConfig, ICredentialsConfig } from './config';
import { catchError, mergeMap, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

interface ICredentialsResponse {
	authorizedArea: { name: string }[];
	unauthorizedArea: { name: string }[];
}

@Injectable({
	providedIn: 'root'
})
export class CredentialsService {
	data: ICredentialsResponse;
	error: { message: string } = { message: 'loading' };
	user: { name: string };

	constructor(protected httpClient: HttpClient,
				@Inject(credentialsConfig) public config: ICredentialsConfig) {
		this.getCredentials().subscribe();
		this.user = { name: 'Unknown' };
	}

	get authorizedArea() {
		if (!this.data.unauthorizedArea.length) {
			return [{ name: 'You have permissions for everything' }];
		}
		return this.data.authorizedArea;
	}

	get unauthorizedArea() {
		if (!this.data.authorizedArea.length) {
			return [{ name: 'No permissions' }];
		}
		return this.data.unauthorizedArea;
	}

	getUrl(): string {
		return this.config.baseUrl;
	}

	parseResponse(response: any): Observable<string> {
		return of(response);
	}

	openPermissionSite() {
		window.open(this.config.authorizationSiteURL, '_blank');
	}

	downloadGuide() {
		window.open(this.config.authorizationInfoURL, '_blank');
	}

	getCredentials() {
		const url = this.getUrl();
		const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
		const options = { headers };
		return this.httpClient.get(url, options)
			.pipe(
				mergeMap((data: any) => this.parseResponse(data)),
				tap((data: any) => {
					if (data) {
						this.data = data;
						this.error = undefined;
					} else {
						this.error = { message: this.config.noCredentialsMessage }
					}
				}),
				catchError((err) => {
					this.error = { message: this.config.noCredentialsMessage };
					return of(true);
				}));
	}
}
