import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as wellknown from 'wellknown';
import { CasesActionTypes, CasesService, LoadDefaultCaseAction, SelectDilutedCaseAction } from '@ansyn/ansyn';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { concatMap, filter, mergeMap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { selectContextMapPosition } from '../reducers/context.reducer';
import { SetContextParamsAction } from '../actions/context.actions';
import { Geometries, Polygon, Point } from '@turf/turf';
import {
	selectActiveMapId,
	SetMapPositionByRadiusAction,
	SetMapPositionByRectAction,
	SetToastMessageAction
} from '@ansyn/map-facade';
import { ContextName, RequiredContextParams } from '../models/context.config';
import { ImageryCommunicatorService } from '@ansyn/imagery';
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
		concatMap(this.parseContextParams.bind(this))
	);

	@Effect()
	goToPendingContextPosition$ = this.imageryCommunicatorService.instanceCreated.pipe( // wait for map to create
		withLatestFrom(this.store.select(selectContextMapPosition)),
		filter(([{ id }, geo]) => Boolean(geo)),
		mergeMap(([{ id }, geo]) => {
			const actions: unknown[] = [new SetContextParamsAction({ position: undefined })];
			if (geo.type === 'Point') {
				actions.push(new SetMapPositionByRadiusAction({ id, center: geo, radiusInMeters: 100000 }));
			} else {
				actions.push(new SetMapPositionByRectAction({ id, rect: geo }));
			}
			return actions;
		})
	);

	constructor(protected actions$: Actions,
				protected store: Store<any>,
				protected casesService: CasesService,
				protected translateService: TranslateService,
				protected imageryCommunicatorService: ImageryCommunicatorService) {

	}


	parseContextParams([{ payload }, mapId]: [LoadDefaultCaseAction, string]): any[] {
		const { context, ...params } = payload;
		const contextCase = { ...this.casesService.defaultCase };
		const missingParamas = this.isMissingParametersContext(context, params);
		const actions: unknown[] = [new SelectDilutedCaseAction(contextCase)];
		if (missingParamas.length > 0) {
			const toastText = this.buildErrorToastMessage(context, missingParamas);
			actions.push(new SetToastMessageAction({ toastText }));
			return actions;
		}
		switch (context) {
			case ContextName.AreaAnalysis:
				const geo: Geometries = <Geometries>wellknown.parse(params.geometry);
				if (!['Point', 'Polygon'].includes(geo.type) ) {
					actions.push(new SetToastMessageAction({toastText: this.translateService.instant(CONTEXT_TOAST.region)}));
					break;
				}
				const to = new Date();
				const from = new Date(to);
				from.setMonth(from.getMonth() - 2);
				contextCase.state = {
					...contextCase.state,
					time: { ...contextCase.state.time, to, from },
					region: geo
				};
				actions.push(new SetContextParamsAction({ position: <Point | Polygon>geo }));
				break;
			default:
				actions.push(new SetToastMessageAction({
						toastText: this.buildErrorToastMessage(context)
					})
				)
		}
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
