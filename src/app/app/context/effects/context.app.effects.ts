import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as wellknown from 'wellknown';
import { CasesActionTypes, CasesService, LoadDefaultCaseAction, SelectCaseAction } from '@ansyn/ansyn';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { filter, withLatestFrom, mergeMap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Geometries } from '@turf/turf';
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


	parseContextParams([{ payload }, mapId]: [LoadDefaultCaseAction, string]): any[] {
		const { context, ...params } = payload;
		let contextCase;
		const missingParams = this.isMissingParametersContext(context, params);
		const actions: unknown[] = [];
		if (missingParams.length > 0) {
			const toastText = this.buildErrorToastMessage(context, missingParams);
			actions.push(new SetToastMessageAction({ toastText }));
			return actions;
		}
		switch (context) {
			case ContextName.AreaAnalysis:
				const geo: Geometries = <Geometries>wellknown.parse(params.geometry);
				if (!['Point', 'Polygon'].includes(geo.type)) {
					actions.push(new SetToastMessageAction({ toastText: this.translateService.instant(CONTEXT_TOAST.region) }));
					break;
				}
				const to = new Date();
				const from = new Date(to);
				from.setMonth(from.getMonth() - 2);
				const _context = {
					id: context,
					time: { to, from }
				};
				contextCase = this.casesService.updateCaseViaContext(_context, this.casesService.defaultCase, params);
				break;
			default:
				actions.push(new SetToastMessageAction({
						toastText: this.buildErrorToastMessage(context)
					})
				);
		}
		actions.push(new SelectCaseAction(contextCase));
		return actions;
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

}
