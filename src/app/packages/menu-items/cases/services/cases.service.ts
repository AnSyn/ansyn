import { CasesConfig } from './../models/cases-config';
import { Injectable, InjectionToken, Inject } from '@angular/core';
import { Http, Headers, RequestOptions } from "@angular/http";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/debounce";
import { Case } from '../models/case.model';
import { isEmpty } from 'lodash';
import { cloneDeep } from 'lodash';
import * as rison from 'rison';
import { QueryParamsHelper } from './helpers/cases.service.query-params-helper';
import { UrlSerializer } from '@angular/router';

export const casesConfig: InjectionToken<CasesConfig> = new InjectionToken('cases-config');

@Injectable()
export class CasesService {
	base_url;
	LIMIT: number = 15;
	queryParamsHelper: QueryParamsHelper = new QueryParamsHelper(this);
	options = new RequestOptions({ headers: new Headers({'Content-Type': 'application/json'})});

	constructor(private http: Http, @Inject(casesConfig) private config: CasesConfig, public urlSerializer: UrlSerializer) {
		this.base_url = this.config.casesBaseUrl;
		window['rison'] = rison;
	}

	loadCases(last_id: string = '-1'): Observable<any> {
		const url = `${this.base_url}/pagination/${last_id}?limit=${this.LIMIT}`;
		return this.http.get(url, this.options).map(res => res.json())
	}

	createCase(selected_case: Case): Observable<Case> {
		const url: string = `${this.base_url}`;
		const body: string = JSON.stringify(selected_case);
		return this.http.post(url, body, this.options).map(res => res.json());
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
		const body:string = JSON.stringify(selected_case);
		return this.http.put (url, body, this.options).map(res => res.json());
	}

	removeCase(selected_case_id: string): Observable<any> {
		let url: string = `${this.base_url}/${selected_case_id}`;
		return this.http.delete(url,  this.options).map(res => res.json());
	}

	loadContexts(): Observable<any> {
		let url: string = `${this.base_url}/contexts`;
		return this.http.get(url,  this.options).map((res) => res.json());
	}

	loadCase(selected_case_id: string): Observable<any> {
		if (isEmpty(selected_case_id)) {
			return Observable.of("");
		}
		const url = `${this.base_url}/${selected_case_id}`;
		return this.http.get(url,  this.options)
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

	getDefaultCase() {
		return cloneDeep(this.config.defaultCase);
	}

	enhanceDefaultCase(default_case: Case): void {
		default_case.last_modified = new Date();
	}

	get decodeCaseObjects() {
		return this.queryParamsHelper.decodeCaseObjects.bind(this.queryParamsHelper);
	}

	get encodeCaseObjects() {
		return this.queryParamsHelper.encodeCaseObjects.bind(this.queryParamsHelper);
	}

	get generateQueryParamsViaCase() {
		return this.queryParamsHelper.generateQueryParamsViaCase.bind(this.queryParamsHelper);
	}

	get updateCaseViaQueryParmas() {
		return this.queryParamsHelper.updateCaseViaQueryParmas.bind(this.queryParamsHelper);
	}


}
