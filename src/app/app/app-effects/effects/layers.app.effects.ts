import {
	BeginLayerTreeLoadAction,
	HideAnnotationsLayer,
	LayersActionTypes,
	ShowAnnotationsLayer
} from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { CasesActionTypes, SelectCaseAction, UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/withLatestFrom';
import { cloneDeep as _cloneDeep, isEmpty } from 'lodash';
import { AnnotationVisualizerAgentAction } from '@ansyn/menu-items/tools/actions/tools.actions';
import { Case } from '@ansyn/core/models/case.model';
import { casesStateSelector, ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { IAppState } from '../app-reducers.module';


@Injectable()
export class LayersAppEffects {
	public selectedCase$ = this.store$.select<ICasesState>(casesStateSelector)
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
	selectCase$: Observable<BeginLayerTreeLoadAction> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE)
		.filter(({ payload }: SelectCaseAction) => !isEmpty(payload))
		.map(({ payload }: SelectCaseAction) => {
			return new BeginLayerTreeLoadAction({ caseId: payload.id });
		}).share();

	@Effect()
	showAnnotationsLayer$: Observable<any> = this.actions$
		.ofType<ShowAnnotationsLayer>(LayersActionTypes.COMMANDS.SHOW_ANNOTATIONS_LAYER)
		.withLatestFrom<ShowAnnotationsLayer, Case>(this.selectedCase$)
		.mergeMap(([action, selectedCase]: [ShowAnnotationsLayer, Case]) => {
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
	hideAnnotationsLayer$: Observable<any> = this.actions$
		.ofType<HideAnnotationsLayer>(LayersActionTypes.COMMANDS.HIDE_ANNOTATIONS_LAYER)
		.withLatestFrom<HideAnnotationsLayer, Case>(this.selectedCase$)
		.mergeMap(([action, selectedCase]: [HideAnnotationsLayer, Case]) => {

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
