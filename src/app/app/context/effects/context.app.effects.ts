import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
	CasesActionTypes,
	CasesService,
	ICaseDataInputFiltersState,
	LoadDefaultCaseAction,
	SelectCaseAction
} from '@ansyn/ansyn';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { filter, mergeMap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { selectActiveMapId, SetToastMessageAction } from '@ansyn/map-facade';
import { ContextName, RequiredContextParams } from '../models/context.config';
import { TranslateService } from '@ngx-translate/core';

const CONTEXT_TOAST = {
	paramsError: 'params: {0} is require in {1} context',
	contextError: 'Unknown context {0}',
	region: 'Unknown geometry'
};

@Injectable()
export class ContextAppEffects {

	@Effect()
	loadDefaultCaseContext$: Observable<any> = this.actions$.pipe(
		ofType<LoadDefaultCaseAction>(CasesActionTypes.LOAD_DEFAULT_CASE),
		filter((action: LoadDefaultCaseAction) => action.payload.context),
		withLatestFrom(this.store.select(selectActiveMapId)),
		mergeMap(this.parseContextParams.bind(this))
	);

	constructor(protected actions$: Actions,
				protected store: Store<any>,
				protected casesService: CasesService,
				protected translateService: TranslateService) {

	}

	get defaultTime() {
		const to = new Date();
		const from = new Date(to);
		from.setMonth(from.getMonth() - 2);
		return { from, to };
	}

	parseContextParams([{ payload }, mapId]: [LoadDefaultCaseAction, string]): any[] {
		const { context, ...params } = payload;
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
		const time = this.defaultTime;
		switch (context) {
			case ContextName.AreaAnalysis:
				contextCase = this.casesService.updateCaseViaContext({ time }, this.casesService.defaultCase, params);
				return [new SelectCaseAction(contextCase)];
			case ContextName.QuickSearch:
				this.parseTimeParams(time, params.time);
				const dataInputFilters = this.parseSensorParams(params.sensors);
				contextCase = this.casesService.updateCaseViaContext({
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

	private parseTimeParams(time, contextTime) {
		const [start, end] = contextTime.split(',');
		const from = new Date(start);
		const to = new Date(end);
		if (from.toJSON()) {
			time.from = from;
		}
		if (to.toJSON()) {
			time.to = to;
		}
	}

	private parseSensorParams(sensors): ICaseDataInputFiltersState {
		return {
			filters: [],
			fullyChecked: true,
			customFiltersSensor: sensors.split(',')
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
		return allParams.filter(param => !passParams.includes(param))
	}

	private isValidGeometry(geometry: string) {
		return /POLYGON|POINT/.test(geometry)
	}

}
