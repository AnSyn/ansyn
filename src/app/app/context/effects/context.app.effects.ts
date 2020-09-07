import { Inject, Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import {
	CasesActionTypes,
	CasesService,
	DisplayMultipleOverlaysFromStoreAction,
	GeoRegisteration,
	ICaseDataInputFiltersState,
	IDataInputFilterValue,
	IOverlay,
	LoadDefaultCaseAction,
	LoadOverlaysSuccessAction,
	OverlaysActionTypes,
	LoggerService,
	OverlaysService,
	rxPreventCrash,
	SelectCaseAction,
} from '@ansyn/ansyn';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { filter, mergeMap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { selectActiveMapId, SetLayoutAction, SetToastMessageAction } from '@ansyn/map-facade';
import {
	ContextConfig,
	ContextName,
	IContextConfig,
	RequiredContextParams
} from '../models/context.config';
import { TranslateService } from '@ngx-translate/core';
import { Auth0Service } from '../../imisight/auth0.service';
import { uniq } from 'lodash';
import { SelectOnlyGeoRegistered } from '@ansyn/ansyn';
import * as moment from 'moment';

const CONTEXT_TOAST = {
	paramsError: 'params: {0} is require in {1} context',
	contextError: 'Unknown context {0}',
	region: 'Unknown geometry',
	geoOverlayNotExist: 'There is no Geo registration overlay'
};

@Injectable()
export class ContextAppEffects {

	@Effect()
	loadDefaultCaseContext$: Observable<any> = this.actions$.pipe(
		ofType<LoadDefaultCaseAction>(CasesActionTypes.LOAD_DEFAULT_CASE),
		filter((action: LoadDefaultCaseAction) => action.payload.context),
		withLatestFrom(this.store.select(selectActiveMapId)),
		mergeMap(this.parseContextParams.bind(this)),
		rxPreventCrash()
	);

	@Effect()
	PostContextOpen$: Observable<any> = this.actions$.pipe(
		ofType<SelectCaseAction>(CasesActionTypes.SELECT_CASE_SUCCESS),
		filter(({ payload }) => Boolean(payload.selectedContextId)),
		mergeMap(this.postContextAction.bind(this))
	);

	constructor(protected actions$: Actions,
				protected store: Store<any>,
				protected casesService: CasesService,
				protected translateService: TranslateService,
				protected loggerService: LoggerService,
				protected auth0Service: Auth0Service,
				protected overlaysService: OverlaysService,
				@Inject(ContextConfig) protected config: IContextConfig
	) {
	}

	parseContextParams([{ payload }, mapId]: [LoadDefaultCaseAction, string]): any[] {
		const { context, ...params } = payload;
		const selectedContext = { id: context };
		let contextCase = this.casesService.defaultCase;
		const missingParams = this.isMissingParametersContext(context, params);
		const actions: unknown[] = [new SelectCaseAction(contextCase)];
		if (missingParams.length > 0) {
			const toastText = this.buildErrorToastMessage(context, missingParams);
			actions.push(new SetToastMessageAction({ toastText }));
			return actions;
		}
		if (!this.isValidGeometry(params.geometry)) {
			actions.push(new SetToastMessageAction({ toastText: this.translateService.instant(CONTEXT_TOAST.region) }));
			return actions;
		}

		if (params.sendingSystem) {
			this.loggerService.info(`open context from ${params.sendingSystem}`);
		}
		switch (context) {
			case ContextName.AreaAnalysis:
				contextCase = this.casesService.updateCaseViaContext({
					...selectedContext,
				}, this.casesService.defaultCase, params);
				return [new SelectCaseAction(contextCase)];
			case ContextName.ImisightMission:
				this.auth0Service.setSession({
					accessToken: params.accessToken,
					idToken: params.idToken,
					expiresIn: params.expiresIn
				});

				// If no time is provided, the time will be taken from the configuration file
				contextCase = this.casesService.updateCaseViaContext(selectedContext, this.casesService.defaultCase, params);
				return [new SelectCaseAction(contextCase)];
			case ContextName.QuickSearch:
			case ContextName.TwoMaps:
				const time = this.parseTimeParams(params.time);
				const dataInputFilters = this.parseSensorParams(context === ContextName.TwoMaps ? this.config.TwoMaps.sensors : params.sensors);
				contextCase = this.casesService.updateCaseViaContext({
					...selectedContext,
					time,
					dataInputFilters
				}, this.casesService.defaultCase, params);
				return [new SelectCaseAction(contextCase)];
			default:
				actions.push(new SetToastMessageAction({
						toastText: this.buildErrorToastMessage(context)
					})
				);
		}
		return actions;
	}

	postContextAction(action: SelectCaseAction) {
		switch (action.payload.selectedContextId) {
			case ContextName.TwoMaps:
				return this.actions$.pipe(
					ofType<LoadOverlaysSuccessAction>(OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS),
					filter( ({payload}: {payload: IOverlay[]}) => Boolean(payload.length)),
					mergeMap(({payload}: {payload: IOverlay[]}) => {
						const geoOverlays = this.findGeoOverlays(payload);
						if (Boolean(geoOverlays.length)) {
							return [
								new SetLayoutAction(this.config.TwoMaps.layout),
								new DisplayMultipleOverlaysFromStoreAction(geoOverlays.map( overlay => ({overlay}))),
								new SelectOnlyGeoRegistered()
							]
						}
						else {
							return [new SetToastMessageAction({toastText: CONTEXT_TOAST.geoOverlayNotExist})]
						}

						}
					)
				);
			default:
				return [EMPTY];
		}
	}

	private parseTimeParams(contextTime: string = '') {
		const time = this.casesService.defaultTime;
		const [start, end] = contextTime.split(',');
		const from = new Date(start);
		const to = new Date(end);
		if (moment(from).isValid()) {
			time.from = from;
		}
		if (moment(to).isValid()) {
			time.to = to;
		}
		return time;
	}

	private parseSensorParams(sensors): ICaseDataInputFiltersState {
		const sensorsArray = sensors.split(',');
		const filters: IDataInputFilterValue[] = uniq(sensorsArray
				.map(this.overlaysService.getSensorTypeAndProviderFromSensorName.bind(this.overlaysService))
				.filter(Boolean));
		return {
			filters,
			fullyChecked: filters.length === 0,
			customFiltersSensor: sensorsArray
		}
	}

	private buildErrorToastMessage(contextName: string, params?: string[]) {
		if (params) {
			return this.translateService.instant(CONTEXT_TOAST.paramsError).replace('{0}', params.join(', ')).replace('{1}', contextName);
		}
		return this.translateService.instant(CONTEXT_TOAST.contextError.replace('{0}', contextName));

	}

	private isMissingParametersContext(contextName: string, params: { [key: string]: unknown }) {
		const passParams = Object.keys(params);
		const allParams = RequiredContextParams[contextName];
		return Boolean(allParams) ? allParams.filter(param => !passParams.includes(param)) : [];
	}

	private isValidGeometry(geometry: string) {
		return /POLYGON|POINT/i.test(geometry)
	}

	private findGeoOverlays(overlays: IOverlay[], numOfOverlays: number = 1): IOverlay[] {
		const onlyGeoRegisteredOverlay = overlays.filter( overlay => overlay.isGeoRegistered !== GeoRegisteration.notGeoRegistered)
			// make sure the array in ascending order by date
			.sort( (a, b) => a.date.getTime() - b.date.getTime());
		return onlyGeoRegisteredOverlay.slice( onlyGeoRegisteredOverlay.length - numOfOverlays);
	}

}
