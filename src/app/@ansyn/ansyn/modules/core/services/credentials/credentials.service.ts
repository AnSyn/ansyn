import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { credentialsConfig, ICredentialsConfig } from './config';
import { catchError, mergeMap, take, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

interface ICredentialsLocation {
	Name: string,
	Id: number
};

export interface ICredentialsResponse {
	authorizedAreas: ICredentialsLocation[];
	unauthorizedAreas: ICredentialsLocation[];
}

@Injectable({
	providedIn: 'root'
})
export class CredentialsService {
	data: ICredentialsResponse;
	error: { message: string } = { message: 'loading' };

	constructor(protected httpClient: HttpClient,
				@Inject(credentialsConfig) public config: ICredentialsConfig) {
		this.getCredentials().pipe(take(1)).subscribe();
	}

	get user(): string {
		return 'unknown';
	}

	get titleUser(): string {
		return '';
	}

	get authorizedAreas(): ICredentialsLocation[] {
		return this.data.authorizedAreas;
	}

	get unauthorizedAreas(): ICredentialsLocation[] {
		return this.data.unauthorizedAreas;
	}

	getUrl(): string {
		return this.config.userCredentialsBaseUrl;
	}

	parseResponse(response: any): Observable<string> {
		return of(response);
	}

	openPermissionSite(): void {
		window.open(this.config.authorizationSiteURL, '_blank');
	}

	downloadGuide(): void {
		window.open(this.config.authorizationInfoURL, '_blank');
	}

	getCredentials(): Observable<any> {
		if (!this.data) {
			const url = this.getUrl();
			const headers = new HttpHeaders({'Content-Type': 'application/json'});
			const options = {headers};
			return this.httpClient.get(url, options)
				.pipe(
					mergeMap((data: any) => this.parseResponse(data)),
					tap((data: any) => {
						if (data) {
							this.data = data;
							this.error = undefined;
						} else {
							this.error = {message: this.config.noCredentialsMessage}
						}
					}),
					catchError((err) => {
						this.error = {message: this.config.noCredentialsMessage};
						return of(true);
					}));
		}
		return of(this.data)
	}
}
