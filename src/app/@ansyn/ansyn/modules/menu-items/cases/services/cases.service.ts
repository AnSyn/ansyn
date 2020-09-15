import { ICasesConfig } from '../models/cases-config';
import { Inject, Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { ILinksConfig, QueryParamsHelper, linksConfig } from './helpers/cases.service.query-params-helper';
import { UrlSerializer } from '@angular/router';
import { UUID } from 'angular2-uuid';
import { cloneDeep, cloneDeep as _cloneDeep, isEqual as _isEqual, mapValues } from 'lodash';
import { catchError, map, take, tap } from 'rxjs/operators';
/* Do not change this ( rollup issue ) */
import * as momentNs from 'moment';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { IDeltaTime } from '../../../core/models/time.model';
import { IStoredEntity, StorageService } from '../../../core/services/storage/storage.service';
import {
	ICase,
	ICasePreview,
	ICaseState,
	ICaseTimeState, IDilutedCase,
	IDilutedCaseState
} from '../models/case.model';
import { TranslateService } from '@ngx-translate/core';
import { SelectDilutedCaseAction } from '../actions/cases.actions';

const moment = momentNs;

export const casesConfig = 'casesConfig';

// @dynamic
@Injectable()
export class CasesService {
	defaultSearchFromDeltaTime: IDeltaTime = this.config.defaultSearchFromDeltaTime || {
		unit: 'years',
		amount: 1
	};

	defaultTime: ICaseTimeState = {
		from: moment().subtract(this.defaultSearchFromDeltaTime.amount, this.defaultSearchFromDeltaTime.unit).toDate(),
		to: new Date()
	};

	queryParamsHelper: QueryParamsHelper = new QueryParamsHelper(this);
	baseUrl;
	paginationLimit = 15;
	queryParamsKeys;
	latestStoredEntity: any;

	constructor(protected storageService: StorageService,
				@Inject(casesConfig) public config: ICasesConfig,
				@Inject(linksConfig) public linksConfig: ILinksConfig,
				public urlSerializer: UrlSerializer,
				protected translator: TranslateService,
				public errorHandlerService: ErrorHandlerService) {
		this.paginationLimit = this.config.paginationLimit;
		this.queryParamsKeys = this.config.casesQueryParamsKeys;
	}

	get defaultCase() {
		return this.config.defaultCase;
	}

	getLink(linkId: string) {
		return this.storageService.get(this.linksConfig.schema, linkId).pipe(
			map(caseData => {
				const dilutedCase: IDilutedCase = {
					state: <ICaseState>caseData.data,
					creationTime: new Date(),
					id: linkId
				};
				return new SelectDilutedCaseAction(dilutedCase);
			}),
			catchError(() => EMPTY)
		);
	}

	get generateQueryParamsViaCase() {
		return this.queryParamsHelper.generateQueryParamsViaCase.bind(this.queryParamsHelper);
	}

	get updateCaseViaContext() {
		return this.queryParamsHelper.updateCaseViaContext.bind(this.queryParamsHelper);
	}

	loadCases(casesOffset: number = 0): Observable<any> {
		return this.storageService.getPage<ICasePreview>(this.config.schema, casesOffset, this.paginationLimit)
			.pipe(
				map(previews => previews.map(preview => this.parseCasePreview(preview))),
				catchError(err => this.errorHandlerService.httpErrorHandle(err, this.translator.instant('Failed to load cases')))
			);
	}

	parseCasePreview(casePreview: ICasePreview): ICasePreview {
		return <any>{
			...casePreview,
			creationTime: new Date(casePreview.creationTime),
			lastModified: new Date(casePreview.lastModified)
		};
	}

	parseCase(caseValue: ICase): ICase {
		return <any>{
			...caseValue,
			creationTime: new Date(caseValue.creationTime),
			lastModified: new Date(caseValue.lastModified),
			state: {
				...caseValue.state,
				time: Boolean(caseValue.state.time) ? {
					...caseValue.state.time,
					from: new Date(caseValue.state.time.from),
					to: new Date(caseValue.state.time.to)
				} : null
			}
		};
	}

	getPreview(caseValue: ICase): ICasePreview {
		const casePreview: ICasePreview = {
			id: caseValue.id,
			name: caseValue.name,
			autoSave: caseValue.autoSave,
			creationTime: caseValue.creationTime,
			owner: caseValue.owner,
			lastModified: caseValue.lastModified
		};

		if (caseValue.selectedContextId) {
			casePreview.selectedContextId = caseValue.selectedContextId;
		}

		return casePreview;
	}

	pluckIdSourceType(state: ICaseState): IDilutedCaseState {
		const dilutedState: any = cloneDeep(state);
		if (dilutedState) {
			if (Array.isArray(dilutedState.favoriteOverlays)) {
				dilutedState.favoriteOverlays = dilutedState.favoriteOverlays.map(overlay => ({
					id: overlay.id,
					sourceType: overlay.sourceType
				}));
			}
			if (Array.isArray(dilutedState.presetOverlays)) {
				dilutedState.presetOverlays = dilutedState.presetOverlays.map(overlay => ({
					id: overlay.id,
					sourceType: overlay.sourceType
				}));
			}

			if (dilutedState.miscOverlays && typeof dilutedState.miscOverlays === 'object') {
				dilutedState.miscOverlays = mapValues(dilutedState.miscOverlays, overlay => {
					return overlay ? { id: overlay.id, sourceType: overlay.sourceType } : null;
				});
			}

			if (Array.isArray(dilutedState.maps.data)) {
				dilutedState.maps.data.forEach((mapData: any) => {
					if (Boolean(mapData.data.overlay)) {
						mapData.data.overlay = {
							id: mapData.data.overlay.id,
							sourceType: mapData.data.overlay.sourceType
						};
					}
				});
			}
		}
		return dilutedState;
	}

	convertToStoredEntity(caseValue: ICase): IStoredEntity<ICasePreview, IDilutedCaseState> {
		return {
			preview: this.getPreview(caseValue),
			data: this.pluckIdSourceType(caseValue.state)
		};
	}

	createCase(selectedCase: ICase): Observable<ICase> {
		const currentTime = new Date();
		const uuid = this.generateUUID();
		selectedCase.id = uuid;
		selectedCase.creationTime = currentTime;
		selectedCase.lastModified = currentTime;
		selectedCase.autoSave = true;
		return this.storageService.create(this.config.schema, this.convertToStoredEntity(selectedCase))
			.pipe(
				map(_ => selectedCase),
				catchError(err => this.errorHandlerService.httpErrorHandle(err, 'Failed to create case'))
			);
	}

	generateUUID(): string {
		return UUID.UUID();
	}

	createLink(link): Observable<any> {
		return this.storageService.create(this.linksConfig.schema, link).pipe(
			map((_: any) => _._id)
		);
	}

	updateCase(selectedCase: ICase): Observable<IStoredEntity<ICasePreview, IDilutedCaseState>> {
		const storeEntity = this.convertToStoredEntity(selectedCase);
		if (this.isStoreEntitiesEqual(storeEntity, this.latestStoredEntity)) {
			return EMPTY;
		}
		this.latestStoredEntity = _cloneDeep(storeEntity);
		return this.storageService.update(this.config.schema, storeEntity)
			.pipe<any>(catchError(err => this.errorHandlerService.httpErrorHandle(err)));
	}

	removeCase(selectedCaseId: string): Observable<any> {
		return this.storageService.delete(this.config.schema, selectedCaseId).pipe(
			catchError(err => this.errorHandlerService.httpErrorHandle(err, `Case cannot be deleted`))
		);
	}

	loadCase(selectedCaseId: string): Observable<any> {
		return this.storageService.get<ICasePreview, ICaseState>(this.config.schema, selectedCaseId)
			.pipe(
				tap((latestStoredEntity) => this.latestStoredEntity = _cloneDeep(latestStoredEntity)),
				map(storedEntity =>
					this.parseCase(<ICase>{ ...storedEntity.preview, state: storedEntity.data }))
			).pipe(
				catchError(err => this.errorHandlerService.httpErrorHandle(err)));
	}

	generateLinkById(id: string, schema: 'case' | 'link' = 'case') {
		const baseLocation = location.href.split('#')[0];
		const href = this.config.useHash ? `${ baseLocation }#` : baseLocation;
		return `${ href }/${schema}/${ id }`;
	}

	isStoreEntitiesEqual(caseA, caseB) {
		// caseA.data == undefined, can happen if you update only the preview data (of other case such as "name" -> updates the preview only)
		if (!caseA || !caseB || !caseA.data || !caseB.data) {
			return false;
		}
		const cloneA = JSON.parse(JSON.stringify(caseA));
		const cloneB = JSON.parse(JSON.stringify(caseB));
		cloneA.data.maps.data.forEach((map, index) => {
			if (cloneA.data.maps.activeMapId === map.id) {
				cloneA.data.maps.activeMapId = index;
			}
			map.id = index;
		});
		cloneB.data.maps.data.forEach((map, index) => {
			if (cloneB.data.maps.activeMapId === map.id) {
				cloneB.data.maps.activeMapId = index;
			}
			map.id = index;
		});

		return _isEqual(cloneA, cloneB);
	}
}
