import { CasesConfig } from './../models/cases-config';
import { Injectable, InjectionToken, Inject } from '@angular/core';
import { Http, Headers, RequestOptions } from "@angular/http";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/debounce";
import { Case, CaseMapsState, CaseMapState } from '../models/case.model';
import { isEmpty } from 'lodash';
import { cloneDeep } from 'lodash';
import * as rison from 'rison';
import { QueryParamsHelper } from './helpers/cases.service.query-params-helper';
import { UrlSerializer } from '@angular/router';

export const casesConfig: InjectionToken<CasesConfig> = new InjectionToken('cases-config');

@Injectable()
export class CasesService {

	private queryParamsHelper: QueryParamsHelper = new QueryParamsHelper(this);
	base_url;
	paginationLimit: number = 15;
	queryParamsKeys;
	defaultOptions = new RequestOptions({ headers: new Headers({'Content-Type': 'application/json'})});

	constructor(private http: Http, @Inject(casesConfig) private config: CasesConfig, public urlSerializer: UrlSerializer) {
		this.base_url = this.config.casesBaseUrl;
		this.paginationLimit = this.config.casesPaginationLimit;
		this.queryParamsKeys = this.config.casesQueryParamsKeys
	}

	getOverlaysMarkup(caseValue:Case){
		const result = [];

		const activeMapId = caseValue.state.maps.active_map_id;

		caseValue.state.maps.data.forEach( (m :CaseMapState) => {
			if(m.data.selectedOverlay){
				if(m.id === activeMapId){
					result.push({id : m.data.selectedOverlay.id,class: 'active'});
				}else{
					result.push({id: m.data.selectedOverlay.id,class: 'displayed'});
				}
			}
		});

		return result;
	}

	loadCases(last_id: string = '-1'): Observable<any> {
		const url = `${this.base_url}/pagination/${last_id}?limit=${this.paginationLimit}`;
		return this.http.get(url, this.defaultOptions).map(res => res.json())
	}

	createCase(selected_case: Case): Observable<Case> {
		const url: string = `${this.base_url}`;
		const body: string = JSON.stringify(selected_case);
		return this.http.post(url, body, this.defaultOptions).map(res => res.json());
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
		return this.http.put (url, body, this.defaultOptions).map(res => res.json());
	}

	removeCase(selected_case_id: string): Observable<any> {
		const url: string = `${this.base_url}/${selected_case_id}`;
		return this.http.delete(url,  this.defaultOptions).map(res => res.json());
	}

	loadContexts(): Observable<any> {
		const url: string = `${this.base_url}/contexts`;
		return this.http.get(url,  this.defaultOptions).map((res) => res.json());
	}

	loadCase(selected_case_id: string): Observable<any> {
		if (isEmpty(selected_case_id)) {
			return Observable.of("");
		}
		const url = `${this.base_url}/${selected_case_id}`;
		return this.http.get(url,  this.defaultOptions)
			.map(res => res.json())
			.catch((error) => {
				console.warn(error);
				return Observable.empty();
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
