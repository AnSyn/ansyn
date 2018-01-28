import { ICasesConfig } from '../models/cases-config';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounce';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/of';
import { Case } from '../models/case.model';
import { QueryParamsHelper } from './helpers/cases.service.query-params-helper';
import { UrlSerializer } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ErrorHandlerService } from '@ansyn/core';

export const casesConfig: InjectionToken<ICasesConfig> = new InjectionToken('cases-config');

@Injectable()
export class CasesService {
	static defaultCase: Case;

	queryParamsHelper: QueryParamsHelper = new QueryParamsHelper(this);
	baseUrl;
	paginationLimit = 15;
	queryParamsKeys;

	public contextValues = {
		imageryCountBefore: -1,
		imageryCountAfter: -1,
		defaultOverlay: '',
		time: undefined
	};

	constructor(protected http: HttpClient, @Inject(casesConfig) public config: ICasesConfig, public urlSerializer: UrlSerializer,
				@Inject(ErrorHandlerService) public errorHandlerService: ErrorHandlerService) {
		this.baseUrl = this.config.baseUrl;
		this.paginationLimit = this.config.paginationLimit;
		this.queryParamsKeys = this.config.casesQueryParamsKeys;
		CasesService.defaultCase = config.defaultCase;
	}

	loadCases(lastId: string = '-1'): Observable<any> {
		const url = `${this.baseUrl}/pagination/${lastId}?limit=${this.paginationLimit}`;
		return this.http.get(url).catch(err => {
			return this.errorHandlerService.httpErrorHandle(err);
		});
	}

	createCase(selectedCase: Case): Observable<Case> {
		const url = `${this.baseUrl}`;
		return this.http.post<Case>(url, selectedCase).catch(err => {
			return this.errorHandlerService.httpErrorHandle(err);
		});
	}

	wrapUpdateCase(selectedCase: Case): Observable<Case> {
		return Observable.create(observer => observer.next(Date.now()))
			.debounceTime(this.config.updateCaseDebounceTime)
			.switchMap(() => this.updateCase(selectedCase))
			.catch(err => {
				return this.errorHandlerService.httpErrorHandle(err);
			});
	}

	updateCase(selectedCase: Case): Observable<Case> {
		const url = `${this.baseUrl}`;
		return this.http.put<Case>(url, selectedCase).catch(err => {
			return this.errorHandlerService.httpErrorHandle(err);
		});
	}

	removeCase(selectedCaseId: string): Observable<any> {
		const url = `${this.baseUrl}/${selectedCaseId}`;
		return this.http.delete(url).catch(err => {
			return this.errorHandlerService.httpErrorHandle(err);
		});
	}

	loadContexts(): Observable<any> {
		const url = `${this.baseUrl}/contexts`;
		return this.http.get(url).catch(err => {
			return this.errorHandlerService.httpErrorHandle(err);
		});
	}

	loadCase(selectedCaseId: string): Observable<any> {
		const url = `${this.baseUrl}/${selectedCaseId}`;
		return this.http.get(url).catch(err => {
			return this.errorHandlerService.httpErrorHandle(err);
		});

	}

	generateLinkWithCaseId(caseId: string) {
		const baseLocation = this.config.useHash ? `${location.origin}/#` : location.origin;
		return `${baseLocation}/case/${caseId}`;
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
