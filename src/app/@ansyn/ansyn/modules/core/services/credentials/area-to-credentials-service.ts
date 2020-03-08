import { Inject, Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { credentialsConfig, ICredentialsConfig } from "./config";
import { Observable, of } from "rxjs";
import { GeoJSON } from "geojson";
import { catchError, map, mergeMap } from "rxjs/operators";

@Injectable()
export class AreaToCredentialsService{
	constructor(protected httpClient: HttpClient, @Inject(credentialsConfig) public config: ICredentialsConfig) {
	}

	parseResponse(response: any): Observable<string> {
		return of(response);
	}

	getUrl(): string {
		return this.config.classificationsOfAreaBaseUrl;
	}

	// right now we are only about the triangle number, not the publish procedure.
	// we let the user know that he doesn't have the right triangle for the area, with no regards to the clearance level

	getAreaTriangles(area: GeoJSON) {
		const url = this.getUrl();
		const headers = new HttpHeaders({'Content-Type': 'application/json'});
		const body = '"${wellknown.stringify(area)}"';
		const options = {headers};
		return this.httpClient.post(url, body, options)
			.pipe(
				mergeMap((data: any) => this.parseResponse(data)),
				map((data: any) => {
					return data;
				}),
				catchError((err) => {
				return of(false);
				}));
	}
}
