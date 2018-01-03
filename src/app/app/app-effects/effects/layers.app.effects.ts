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
import { IAppState } from '../app.effects.module';
import { ContainerChangedTriggerAction } from '@ansyn/menu/actions/menu.actions';
import { ShowAnnotationsLayerOnInit } from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';


@Injectable()
export class LayersAppEffects {
	public selectedCase$ = this.store$.select<ICasesState>(casesStateSelector)
		.pluck<ICasesState, Case>('selectedCase')
		.map((selectedCase) => _cloneDeep<Case>(selectedCase));

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

	/**
	 * @type Effect
	 * @name showAnnotationsLayerOnInit$
	 * @ofType ShowAnnotationsLayerOnInit
	 */
	@Effect({ dispatch: false })
	showAnnotationsLayerOnInit$: Observable<any> = this.actions$
		.ofType<ShowAnnotationsLayerOnInit>(LayersActionTypes.COMMANDS.SHOW_ANNOTATIONS_LAYER_ON_INIT)
		.map((action) => {
			this.imageryCommunicatorService.onInit$.subscribe(() => {
				// not initialized - dispatch after init
				this.store$.dispatch(new ShowAnnotationsLayer(action.payload));
			});
		});

	/**
	 * @type Effect
	 * @name showAnnotationsLayer$,
	 * @ofType ShowAnnotationsLayer
	 * @action AnnotationVisualizerAgentAction,UpdateCaseAction?
	 */
	@Effect()
	showAnnotationsLayer$: Observable<any> = this.actions$
		.ofType<ShowAnnotationsLayer>(LayersActionTypes.COMMANDS.SHOW_ANNOTATIONS_LAYER)
		.withLatestFrom<ShowAnnotationsLayer, Case>(this.selectedCase$)
		.mergeMap(([action, selectedCase]: [ShowAnnotationsLayer, Case]) => {
			const actions: any[] = [new AnnotationVisualizerAgentAction({
				action: 'show',
				maps: 'all'
			})];

			if (Boolean(action.payload.update)) {
				selectedCase.state.layers.displayAnnotationsLayer = true;
				actions.push(new UpdateCaseAction(selectedCase));
			}

			return actions;
		});

	/**
	 * @type Effect
	 * @name hideAnnotationsLayer$,
	 * @ofType HideAnnotationsLayer
	 * @action AnnotationVisualizerAgentAction,UpdateCaseAction?
	 */
	@Effect()
	hideAnnotationsLayer$: Observable<any> = this.actions$
		.ofType<HideAnnotationsLayer>(LayersActionTypes.COMMANDS.HIDE_ANNOTATIONS_LAYER)
		.withLatestFrom<HideAnnotationsLayer, Case>(this.selectedCase$)
		.mergeMap(([action, selectedCase]: [HideAnnotationsLayer, Case]) => {

			const actions: any[] = [new AnnotationVisualizerAgentAction({
				action: 'removeLayer',
				maps: 'all'
			})];

			if (Boolean(action.payload.update)) {
				selectedCase.state.layers.displayAnnotationsLayer = false;
				actions.push(new UpdateCaseAction(selectedCase));
			}

			return actions;
		});

	/**
	 * @type Effect
	 * @name renderMaps$,
	 * @ofType SelectLayerAction, UnselectLayerAction
	 * @action
	 */
	@Effect()
	redrawMaps$: Observable<any> = this.actions$
		.ofType<any>(LayersActionTypes.SELECT_LAYER, LayersActionTypes.UNSELECT_LAYER)
		.map(action => new ContainerChangedTriggerAction());

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
	}
}
