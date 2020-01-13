import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { credentialsConfig, ICredentialsConfig } from './config';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class CredentialsService {
	approveArea: {name: string}[];
	notApproveArea: {name: string}[];
	error: {message: string};
	user: {name: string};

	constructor(protected httpClient: HttpClient,
				@Inject(credentialsConfig) public config: ICredentialsConfig) {
		this.getCredentials().subscribe();
		this.user = {name: 'Tzahi Levi'};
	}

	getUrl(): string {
		return this.config.baseUrl;
	}

	parseResponse(response: any): Observable<string> {
		return of(response);
	}

	openPermissionSite() {
		window.open(this.config.permissionSite, "_blank");
	}

	downloadGuide() {
		window.open(this.config.permissionGuid, "_blank");
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
						this.approveArea = data.location
						this.notApproveArea = data.not;
					}
					else {
						this.error.message = this.config.noCredentialsMessage;
					}
				}),
				catchError((err) => {
					this.error.message = this.config.noCredentialsMessage;
					this.approveArea = [];
					this.notApproveArea = []
					return of(true);
				}));
	}
}
