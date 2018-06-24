import { ICasesConfig } from '../models/cases-config';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounce';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/of';
import { Case } from '../models/case.model';
import { QueryParamsHelper } from './helpers/cases.service.query-params-helper';
import { UrlSerializer } from '@angular/router';
import { UUID } from 'angular2-uuid';
import * as moment from 'moment';
import { StorageService, StoredEntity } from '@ansyn/core/services/storage/storage.service';
import { CasePreview, CaseState, CaseTimeState, IContextEntity } from '@ansyn/core/models/case.model';
import { ErrorHandlerService } from '@ansyn/core/services/error-handler.service';
import { cloneDeep } from 'lodash';

export const casesConfig: InjectionToken<ICasesConfig> = new InjectionToken('cases-config');

@Injectable()
export class CasesService {
	static defaultTime: CaseTimeState = {
		type: 'absolute',
		from: moment().subtract(1, 'y').toDate(),
		to: new Date()
	};

	queryParamsHelper: QueryParamsHelper = new QueryParamsHelper(this);
	baseUrl;
	paginationLimit = 15;
	queryParamsKeys;

	get defaultCase() {
		return this.config.defaultCase;
	}

	constructor(protected storageService: StorageService,
				@Inject(casesConfig) public config: ICasesConfig,
				public urlSerializer: UrlSerializer,
				public errorHandlerService: ErrorHandlerService) {
		this.paginationLimit = this.config.paginationLimit;
		this.queryParamsKeys = this.config.casesQueryParamsKeys;
	}

	loadCases(casesOffset: number = 0): Observable<any> {
		return this.storageService.getPage<CasePreview>(this.config.schema, casesOffset, this.paginationLimit)
			.map(previews => previews.map(preview => this.parseCasePreview(preview)))
			.catch(err => this.errorHandlerService.httpErrorHandle(err, 'Failed to load cases'));
	}

	parseCasePreview(casePreview: CasePreview): CasePreview {
		return <any> {
			...casePreview,
			creationTime: new Date(casePreview.creationTime),
			lastModified: new Date(casePreview.lastModified)
		};
	}

	parseCase(caseValue: Case): Case {
		return <any> {
			...caseValue,
			creationTime: new Date(caseValue.creationTime),
			lastModified: new Date(caseValue.lastModified),
			state: {
				...caseValue.state,
				time: Boolean(caseValue.state.time) ? {
					...caseValue.state.time,
					from: new Date(caseValue.state.time.from),
					to: new Date(caseValue.state.time.to)
				} : null,
				contextEntities: caseValue.state.contextEntities ?
					caseValue.state.contextEntities.map((contextEntity: IContextEntity) => ({
						...contextEntity,
						date: new Date(contextEntity.date)
					})) : null
			}
		};
	}

	getPreview(caseValue: Case): CasePreview {
		const casePreview: CasePreview = {
			id: caseValue.id,
			name: caseValue.name,
			creationTime: caseValue.creationTime,
			owner: caseValue.owner,
			lastModified: caseValue.lastModified
		};

		if (caseValue.selectedContextId) {
			casePreview.selectedContextId = caseValue.selectedContextId;
		}

		return casePreview;
	}

	pluckIdSourceType(state: CaseState) {
		let dilutedState: any = cloneDeep(state);

		if (Array.isArray(dilutedState.favoriteOverlays)) {
			dilutedState.favoriteOverlays = dilutedState.favoriteOverlays.map(overlay => ({
				id: overlay.id,
				sourceType: overlay.sourceType
			}));
		}

		if (Array.isArray(dilutedState.maps.data)) {
			dilutedState.maps.data.forEach((mapData: any) => {
				if (Boolean(mapData.data.overlay)) {
					mapData.data.overlay = { id: mapData.data.overlay.id, sourceType: mapData.data.overlay.sourceType };
				}
			});
		}

		return dilutedState;
	}

	convertToStoredEntity(caseValue: Case): StoredEntity<CasePreview, CaseState> {
		return {
			preview: this.getPreview(caseValue),
			data: this.pluckIdSourceType(caseValue.state)
		};
	}

	createCase(selectedCase: Case): Observable<Case> {
		const currentTime = new Date();
		const uuid = UUID.UUID();
		selectedCase.id = uuid;
		selectedCase.creationTime = currentTime;
		selectedCase.lastModified = currentTime;
		return this.storageService.create(this.config.schema, this.convertToStoredEntity(selectedCase))
			.map(_ => selectedCase)
			.catch(err => {
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

	updateCase(selectedCase: Case): Observable<StoredEntity<CasePreview, CaseState>> {
		return this.storageService.update(this.config.schema, this.convertToStoredEntity(selectedCase)).catch(err => {
			return this.errorHandlerService.httpErrorHandle(err);
		});
	}

	removeCase(selectedCaseId: string): Observable<any> {
		return this.storageService.delete(this.config.schema, selectedCaseId).catch(err => {
			return this.errorHandlerService.httpErrorHandle(err);
		});
	}

	loadCase(selectedCaseId: string): Observable<any> {
		return this.storageService.get<CasePreview, CaseState>(this.config.schema, selectedCaseId)
			.map(storedEntity =>
				this.parseCase(<Case>{ ...storedEntity.preview, state: storedEntity.data }))
			.catch(err => this.errorHandlerService.httpErrorHandle(err));
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
