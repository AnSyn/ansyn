import { ICasesConfig } from '../models/cases-config';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounce';
import 'rxjs/add/observable/of';
import { Case, CaseMapState } from '../models/case.model';
import { isEmpty } from 'lodash';
import { QueryParamsHelper } from './helpers/cases.service.query-params-helper';
import { UrlSerializer } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export const casesConfig: InjectionToken<ICasesConfig> = new InjectionToken('cases-config');

@Injectable()
export class CasesService {

	static defaultCase: Case;

	queryParamsHelper: QueryParamsHelper = new QueryParamsHelper(this);
	base_url;
	paginationLimit = 15;
	queryParamsKeys;

	public contextValues = {
		imageryCount: -1,
		defaultOverlay: ''
	};

	static getOverlaysMarkup(caseValue: Case, hoverId?: string) {
		const result = [];

		const activeMapId = caseValue.state.maps.active_map_id;

		caseValue.state.maps.data.forEach((map: CaseMapState) => {
			if (!isEmpty(map.data.overlay)) {
				if (map.id === activeMapId) {
					result.push({ id: map.data.overlay.id, class: 'active' });
				} else {
					result.push({ id: map.data.overlay.id, class: 'displayed' });
				}
			}
		});

		if (caseValue.state.favoritesOverlays) {
			caseValue.state.favoritesOverlays.forEach(item => result.push({ id: item, class: 'favorites' }));
		}

		if (hoverId) {
			result.push({ id: hoverId, class: 'hover' });
		}

		return result;
	}

	constructor(private http: HttpClient, @Inject(casesConfig) public config: ICasesConfig, public urlSerializer: UrlSerializer) {
		this.base_url = this.config.baseUrl;
		this.paginationLimit = this.config.paginationLimit;
		this.queryParamsKeys = this.config.casesQueryParamsKeys;
		CasesService.defaultCase = config.defaultCase;
	}

	loadCases(last_id: string = '-1'): Observable<any> {
		const url = `${this.base_url}/pagination/${last_id}?limit=${this.paginationLimit}`;
		return this.http.get(url);
	}

	createCase(selected_case: Case): Observable<Case> {
		const url = `${this.base_url}`;
		return this.http.post<Case>(url, selected_case);
	}

	wrapUpdateCase(selected_case: Case): Observable<Case> {
		return Observable.create(observer => observer.next(Date.now()))
			.debounceTime(this.config.updateCaseDebounceTime)
			.switchMap(() => this.updateCase(selected_case));
	}

	updateCase(selected_case: Case): Observable<Case> {
		const url = `${this.base_url}`;
		return this.http.put<Case>(url, selected_case);
	}

	removeCase(selected_case_id: string): Observable<any> {
		const url = `${this.base_url}/${selected_case_id}`;
		return this.http.delete(url);
	}

	loadContexts(): Observable<any> {
		const url = `${this.base_url}/contexts`;
		return this.http.get(url);
	}

	loadCase(selected_case_id: string): Observable<any> {
		const url = `${this.base_url}/${selected_case_id}`;
		return this.http.get(url);

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
