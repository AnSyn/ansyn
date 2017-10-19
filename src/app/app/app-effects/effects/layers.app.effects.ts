import { BeginLayerTreeLoadAction, LayersActionTypes } from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { CasesActionTypes, SelectCaseAction, UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/withLatestFrom';
import { cloneDeep as _cloneDeep, isEmpty } from 'lodash';
import { AnnotationVisualizerAgentAction } from '@ansyn/menu-items/tools/actions/tools.actions';
import { Case } from '@ansyn/core/models/case.model';
import { ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { IAppState } from '../app-reducers.module';


@Injectable()
export class LayersAppEffects {
	public selectedCase$ = this.store$.select<ICasesState>('cases')
		.pluck<ICasesState, Case>('selectedCase')
		.map(_cloneDeep)
	/**
	 * @type Effect
	 * @name selectCase$
	 * @ofType SelectCaseAction
	 * @filter The selected case is not empty
	 * @action BeginLayerTreeLoadAction
	 */
	@Effect()
	selectCase$: Observable<Action> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE)
		.filter(({ payload }: SelectCaseAction) => !isEmpty(payload))
		.map(({ payload }: SelectCaseAction) => {
			return new BeginLayerTreeLoadAction({ caseId: payload.id });
		}).share();

	@Effect()
	showAnnotationsLayer$: Observable<Action> = this.actions$
		.ofType(LayersActionTypes.COMMANDS.SHOW_ANNOTATIONS_LAYER)
		.withLatestFrom<Action, Case>(this.selectedCase$)
		.mergeMap(([action, selectedCase]: [Action, Case]) => {
			const actions = [new AnnotationVisualizerAgentAction({
				action: 'show',
				maps: 'all'
			})];

			if (Boolean(action.payload.update)) {
				selectedCase.state.layers.displayAnnotationsLayer = true;
				actions.push(new UpdateCaseAction(selectedCase))
			}

			return actions;
		});

	@Effect()
	hideAnnotationsLayer$: Observable<Action> = this.actions$
		.ofType(LayersActionTypes.COMMANDS.HIDE_ANNOTATIONS_LAYER)
		.withLatestFrom<Action, Case>(this.selectedCase$)
		.do( res => console.log(res))
		.mergeMap(([action, selectedCase]: [Action, Case]) => {

		const actions = [new AnnotationVisualizerAgentAction({
				action: 'removeLayer',
				maps: 'all'
			})];

			if (Boolean(action.payload.update)) {
				selectedCase.state.layers.displayAnnotationsLayer = false;
				actions.push(new UpdateCaseAction(selectedCase))
			}

			return actions;
		});

	constructor(public actions$: Actions, public store$: Store<IAppState>) {
	}
}
