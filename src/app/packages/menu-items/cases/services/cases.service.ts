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
import { casesStateSelector, ICasesState } from "../reducers/cases.reducer";
import { Store } from "@ngrx/store";
import { UUID } from "angular2-uuid";

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

	casesOffset$: Observable<number> = this.store.select(casesStateSelector)
		.map(({ cases }: ICasesState) => cases.length );

	casesOffset: number;

	constructor(protected http: HttpClient, @Inject(casesConfig) public config: ICasesConfig, public urlSerializer: UrlSerializer,
				public store: Store<ICasesState>,
				@Inject(ErrorHandlerService) public errorHandlerService: ErrorHandlerService) {
		this.baseUrl = this.config.baseUrl;
		this.paginationLimit = this.config.paginationLimit;
		this.queryParamsKeys = this.config.casesQueryParamsKeys;
		CasesService.defaultCase = config.defaultCase;
		this.casesOffset$.subscribe(casesOffset => this.casesOffset = casesOffset);
	}

	loadCases(): Observable<any> {
		const url = `${this.baseUrl}/cases/?from=${this.casesOffset}&limit=${this.paginationLimit}`;
		return this.http.get(url).catch(err => {
			return this.errorHandlerService.httpErrorHandle(err);
		});
	}

	createCase(selectedCase: Case): Observable<Case> {
		const uuid = UUID.UUID();
		const url = `${this.baseUrl}/cases/${uuid}`;
		selectedCase.id = uuid;
		selectedCase.creationTime = new Date();
		return this.http.post<Case>(url, selectedCase).map(_ => selectedCase).catch(err => {
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
		const url = `${this.baseUrl}/cases/${selectedCase.id}`;
		return this.http.put<Case>(url, selectedCase).catch(err => {
			return this.errorHandlerService.httpErrorHandle(err);
		});
	}

	removeCase(selectedCaseId: string): Observable<any> {
		const url = `${this.baseUrl}/cases/${selectedCaseId}`;
		return this.http.delete(url).catch(err => {
			return this.errorHandlerService.httpErrorHandle(err);
		});
	}

	loadContexts(): Observable<any> {
		const url = `${this.baseUrl}/contexts?from=0&limit=100`;
		return this.http.get(url).catch(err => {
			return this.errorHandlerService.httpErrorHandle(err);
		});
	}

	loadCase(selectedCaseId: string): Observable<any> {
		const url = `${this.baseUrl}/cases/${selectedCaseId}`;
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
