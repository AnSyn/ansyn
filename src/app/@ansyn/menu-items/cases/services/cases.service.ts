import { ICasesConfig } from '../models/cases-config';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { EMPTY, Observable, of } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounce';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/of';
import { ICase } from '../models/case.model';
import { QueryParamsHelper } from './helpers/cases.service.query-params-helper';
import { UrlSerializer } from '@angular/router';
import { UUID } from 'angular2-uuid';
import { StorageService, IStoredEntity } from '@ansyn/core/services/storage/storage.service';
import { ICasePreview, ICaseState, ICaseTimeState, IDilutedCaseState, IContextEntity } from '@ansyn/core/models/case.model';
import { ErrorHandlerService } from '@ansyn/core/services/error-handler.service';
import { cloneDeep } from 'lodash';
import { catchError, map, mergeMap, debounceTime } from 'rxjs/operators';
import moment from 'moment';

export const casesConfig: InjectionToken<ICasesConfig> = new InjectionToken('cases-config');

// @dynamic
@Injectable()
export class CasesService {
	static defaultTime: ICaseTimeState = {
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
		return this.storageService.getPage<ICasePreview>(this.config.schema, casesOffset, this.paginationLimit)
			.pipe(
				map(previews => previews.map(preview => this.parseCasePreview(preview))),
				catchError(err => this.errorHandlerService.httpErrorHandle(err, 'Failed to load cases'))
			)
	}

	parseCasePreview(casePreview: ICasePreview): ICasePreview {
		return <any> {
			...casePreview,
			creationTime: new Date(casePreview.creationTime),
			lastModified: new Date(casePreview.lastModified)
		};
	}

	parseCase(caseValue: ICase): ICase {
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
		const uuid = UUID.UUID();
		selectedCase.id = uuid;
		selectedCase.creationTime = currentTime;
		selectedCase.lastModified = currentTime;
		selectedCase.autoSave = true;
		return this.storageService.create(this.config.schema, this.convertToStoredEntity(selectedCase))
			.pipe(
				map(_ => selectedCase),
				catchError(err => this.errorHandlerService.httpErrorHandle(err, 'Failed to create case'))
			)
	}

	updateCase(selectedCase: ICase): Observable<IStoredEntity<ICasePreview, IDilutedCaseState>> {
		return this.storageService.update(this.config.schema, this.convertToStoredEntity(selectedCase)).catch(err => {
			return this.errorHandlerService.httpErrorHandle(err);
		});
	}

	removeCase(selectedCaseId: string): Observable<any> {
		return this.storageService.delete(this.config.schema, selectedCaseId).pipe(
			catchError(err => this.errorHandlerService.httpErrorHandle(err, `Case cannot be deleted`))
		);
	}

	loadCase(selectedCaseId: string): Observable<any> {
		return this.storageService.get<ICasePreview, ICaseState>(this.config.schema, selectedCaseId)
			.pipe(
				map(storedEntity =>
					this.parseCase(<ICase>{ ...storedEntity.preview, state: storedEntity.data }))
			).pipe(
				catchError(err => this.errorHandlerService.httpErrorHandle(err)));
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
