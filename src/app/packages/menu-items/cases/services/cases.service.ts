import { CasesConfig } from './../models/cases-config';
import { Injectable, InjectionToken, Inject } from '@angular/core';
import { Http, Headers, RequestOptions } from "@angular/http";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/debounce";
  import 'rxjs/add/observable/of';
import { Case, CaseMapsState, CaseMapState } from '../models/case.model';
import { cloneDeep, isEmpty } from 'lodash';
import * as rison from 'rison';
import { QueryParamsHelper } from './helpers/cases.service.query-params-helper';
import { UrlSerializer } from '@angular/router';
import { Context } from '@ansyn/core/models';
import { getPointByPolygon } from '@ansyn/core/utils/geo';
import { Point } from 'geojson';

import { get as _get} from 'lodash';

export const casesConfig: InjectionToken<CasesConfig> = new InjectionToken('cases-config');

@Injectable()
export class CasesService {

	private queryParamsHelper: QueryParamsHelper = new QueryParamsHelper(this);
	base_url;
	paginationLimit = 15;
	queryParamsKeys;
	defaultOptions = new RequestOptions({ headers: new Headers({'Content-Type': 'application/json'})});

	public contextValues = {
		imageryCount: -1,
		defaultOverlay: ''
	};

	static activeMap(selectedCase: Case): CaseMapState {
		return selectedCase.state.maps.data.find(map => map.id === selectedCase.state.maps.active_map_id);
	}

	static mapById(selectedCase: Case, id: string): CaseMapState {
		return selectedCase.state.maps.data.find(map => map.id === id);
	}

	constructor(private http: Http, @Inject(casesConfig) public config: CasesConfig, public urlSerializer: UrlSerializer) {
		this.base_url = this.config.casesBaseUrl;
		this.paginationLimit = this.config.casesPaginationLimit;
		this.queryParamsKeys = this.config.casesQueryParamsKeys;
	}

	static getOverlaysMarkup(caseValue: Case, hoverId?:string){
		const result = [];

		const activeMapId = caseValue.state.maps.active_map_id;

		caseValue.state.maps.data.forEach( (map:CaseMapState) => {
			if(!isEmpty(map.data.overlay)){
				if(map.id === activeMapId){
					result.push({id : map.data.overlay.id,class: 'active'});
				}else{
					result.push({id: map.data.overlay.id,class: 'displayed'});
				}
			}
		});

		if (caseValue.state.favoritesOverlays) {
		 	caseValue.state.favoritesOverlays.forEach(item => result.push({id: item,class: 'favorites'}));
		}

		if (hoverId) {
			result.push({id: hoverId, class: 'hover'});
		}

		return result;
	}

	loadCases(last_id: string = '-1'): Observable<any> {
		const url = `${this.base_url}/pagination/${last_id}?limit=${this.paginationLimit}`;
		return this.http.get(url, this.defaultOptions).map(res => res.json())
	}

	createCase(selected_case: Case): Observable<Case> {
		const url = `${this.base_url}`;
		const body = JSON.stringify(selected_case);
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

	getDefaultCase(): Case {
		//this is because of a bug in the aot that does not compile javascript in configuration
		const startDate: string = <string>_get(this,'config.defatulCase.state.time.from') || (new Date(new Date().getTime() - 3600000 * 24 * 365)).toISOString();
		const endDate: string = <string>_get(this,'config.defatulCase.state.time.to') || new Date().toISOString() ;
		const defaultCase =  cloneDeep(this.config.defaultCase);

		defaultCase.state.time.to = endDate;
		defaultCase.state.time.from = startDate ;

		return defaultCase;

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

	get updateCaseViaContext() {
		return this.queryParamsHelper.updateCaseViaContext.bind(this.queryParamsHelper);
	}


}
