import { CasesConfig } from './../models/cases-config';
import { Injectable, InjectionToken, Inject, Renderer } from '@angular/core';
import { Http, Headers, RequestOptions } from "@angular/http";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/debounce";
import { Case } from '../models/case.model';
import { isEmpty } from 'lodash';
import { copyFromContent } from '@ansyn/core/utils';

export const casesConfig: InjectionToken<CasesConfig> = new InjectionToken('cases-config');

@Injectable()
export class CasesService {
	base_url;
	LIMIT: number = 15;

	constructor(private http: Http, @Inject(casesConfig) private config: CasesConfig) {
		this.base_url = this.config.casesBaseUrl;
	}

	loadCases(last_id: string = '-1'): Observable<any> {
		return this.http.get(`${this.base_url}/pagination/${last_id}?limit=${this.LIMIT}`).map(res => res.json())
	}

	createCase(selected_case: Case): Observable<Case> {
		let url: string = `${this.base_url}`;
		let headers = new Headers({ 'Content-Type': 'application/json' });
		let body: string = JSON.stringify(selected_case);
		let options = new RequestOptions({ headers });
		return this.http.post(url, body, options).map(res => res.json());
	}

	wrapUpdateCase(selected_case: Case): Observable<Case>{
		return Observable.create( observer => {
			observer.next(Date.now());
		})
			.debounceTime(this.config.updateCaseDebounceTime)
			.switchMap(() => {
				return this.updateCase(selected_case);
			});
	}

	updateCase(selected_case: Case): Observable<Case> {
		const url:string = `${this.base_url}`;
		const headers = new Headers({ 'Content-Type': 'application/json' });
		const body:string = JSON.stringify(selected_case);
		const options = new RequestOptions({ headers});
		return this.http
			.put (url, body, options)
			.map(res => res.json());
	}

	removeCase(selected_case_id: string): Observable<any> {
		let url: string = `${this.base_url}/${selected_case_id}`;
		let headers = new Headers({ 'Content-Type': 'application/json' });
		let options = new RequestOptions({ headers });
		return this.http.delete(url, options).map(res => res.json());
	}

	loadContexts(): Observable<any> {
		let url: string = `${this.base_url}/contexts`;
		let headers = new Headers({ 'Content-Type': 'application/json' });
		let options = new RequestOptions({ headers });
		return this.http.get(url).map((res) => res.json());
	}

	loadCase(selected_case_id: string): Observable<any> {
		if (isEmpty(selected_case_id)) {
			return Observable.of("");
		}
		const url = `${this.base_url}/${selected_case_id}`;
		const headers = new Headers({ 'Content-Type': 'application/json' });
		const options = new RequestOptions({ headers });
		return this.http.get(url, options)
			.map(res => {
				let response = null;

				try {
					response = res.json();
				} catch (exception) { }

				return response;
			})
			.catch((error) => {
				return Observable.of("");
			});
	}

	loadDefaultCase() {
		return Observable.of(this.config.defaultCase);
	}

	shareCaseLink(s_case: Case): boolean {
		return copyFromContent(<any>s_case);
	}

	enhanceDefaultCase(default_case: Case): void {
		default_case.last_modified = new Date();
	}
}
