import { CasesType, ICasesConfig } from '../models/cases-config';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { QueryParamsHelper } from './helpers/cases.service.query-params-helper';
import { UUID } from 'angular2-uuid';
import { cloneDeep, cloneDeep as _cloneDeep, mapValues } from 'lodash';
import { catchError, map, tap } from 'rxjs/operators';
/* Do not change this ( rollup issue ) */
import * as momentNs from 'moment';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { IDeltaTime } from '../../../core/models/time.model';
import { IStoredEntity, StorageService } from '../../../core/services/storage/storage.service';
import { ICase, ICasePreview, ICaseState, ICaseTimeState, IDilutedCaseState } from '../models/case.model';

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
	latestStoredEntity: any;

	get defaultCase() {
		return this.config.defaultCase;
	}

	get updateCaseViaContext() {
		return this.queryParamsHelper.updateCaseViaContext.bind(this.queryParamsHelper);
	}

	constructor(protected storageService: StorageService,
				@Inject(casesConfig) public config: ICasesConfig,
				public errorHandlerService: ErrorHandlerService) {
		this.paginationLimit = this.config.paginationLimit;
	}

	loadCases(casesOffset: number = 0, casesType: CasesType = CasesType.MyCases): Observable<any> {
		return this.storageService.getPage<ICasePreview>(this.config.schema, casesOffset, this.paginationLimit, casesType)
			.pipe(
				map(previews => previews.map(preview => this.parseCasePreview(preview))),
				catchError(err => this.errorHandlerService.httpErrorHandle(err, 'Failed to load cases'))
			);
	}

	parseCasePreview(casePreview: ICasePreview): ICasePreview {
		return <any>{
			...casePreview,
			creationTime: new Date(casePreview.creationTime),
		};
	}

	parseCase(caseValue: ICase): ICase {
		return <any>{
			...caseValue,
			creationTime: new Date(caseValue.creationTime),
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
			creationTime: caseValue.creationTime
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

	createCase(selectedCase: ICase, currentTime = new Date()): Observable<ICase> {
		const newCase: ICase = {
			...selectedCase,
			creationTime: currentTime,
			autoSave: false
		};
		return this.storageService.create(this.config.schema, this.convertToStoredEntity(newCase))
			.pipe(
				map(_ => newCase),
				catchError(err => this.errorHandlerService.httpErrorHandle(err, err?.error?.message || 'Failed to create case'))
			);
	}

	generateUUID(): string {
		return UUID.UUID();
	}

	removeCase(selectedCaseId: string): Observable<any> {
		return this.storageService.delete(this.config.schema, selectedCaseId).pipe(
			catchError(err => this.errorHandlerService.httpErrorHandle(err, `Case cannot be deleted`))
		);
	}

	loadCase(selectedCaseId: string): Observable<ICase> {
		return this.storageService.get<ICasePreview, ICaseState>(this.config.schema, selectedCaseId)
			.pipe(
				tap((latestStoredEntity) => this.latestStoredEntity = _cloneDeep(latestStoredEntity)),
				map(storedEntity =>
					this.parseCase(<ICase>{ ...storedEntity.preview, state: storedEntity.data }))
			).pipe(
				catchError(err => this.errorHandlerService.httpErrorHandle(err)));
	}

	generateLinkById(id: string) {
		const baseLocation = location.href.split('#')[0];
		const href = this.config.useHash ? `${ baseLocation }#` : baseLocation;
		return `${ href }/case/${ id }`;
	}

	updateCase(updateCase: ICase) {
		return this.storageService.update(this.config.schema, {preview: this.getPreview(updateCase)});
	}
}
