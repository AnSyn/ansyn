import {
	BeginLayerTreeLoadAction, LayersActionTypes, SetAnnotationsLayer,
	ToggleDisplayAnnotationsLayer
} from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { CasesActionTypes, SelectCaseAction, UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/withLatestFrom';
import { isEmpty } from 'lodash';
import { AnnotationVisualizerAgentAction } from '@ansyn/menu-items/tools/actions/tools.actions';
import { Case } from '@ansyn/core/models/case.model';
import { casesStateSelector, ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { IAppState } from '../app.effects.module';
import { ContainerChangedTriggerAction } from '@ansyn/menu/actions/menu.actions';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { ILayerState, layersStateSelector } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';


@Injectable()
export class LayersAppEffects {
	/**
	 * @type Effect
	 * @name selectCase$
	 * @ofType SelectCaseAction
	 * @filter The selected case is not empty
	 * @action ToggleDisplayAnnotationsLayer | BeginLayerTreeLoadAction | SetAnnotationsLayer
	 */
	@Effect()
	selectCase$: Observable<ToggleDisplayAnnotationsLayer | BeginLayerTreeLoadAction | SetAnnotationsLayer> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE)
		.filter(({ payload }: SelectCaseAction) => !isEmpty(payload))
		.mergeMap((action: SelectCaseAction) => [
			new SetAnnotationsLayer(action.payload.state.layers.annotationsLayer),
			new ToggleDisplayAnnotationsLayer(action.payload.state.layers.displayAnnotationsLayer),
			new BeginLayerTreeLoadAction({ caseId: action.payload.id }),
		]).share();

	/**
	 * @type Effect
	 * @name showAnnotationsLayer$,
	 * @ofType ShowAnnotationsLayer
	 * @action AnnotationVisualizerAgentAction
	 */
	@Effect()
	toggleAnnotationsLayer$: Observable<any> = this.actions$
		.ofType<ToggleDisplayAnnotationsLayer>(LayersActionTypes.ANNOTATIONS.TOGGLE_DISPLAY_LAYER)
		.map(({ payload }: ToggleDisplayAnnotationsLayer) => new AnnotationVisualizerAgentAction({
			action: payload ? 'show' : 'removeLayer', maps: 'all'
		}));


	/**
	 * @type Effect
	 * @name renderMaps$,
	 * @ofType SelectLayerAction, UnselectLayerAction
	 * @action ContainerChangedTriggerAction
	 */
	@Effect()
	redrawMaps$: Observable<any> = this.actions$
		.ofType<any>(LayersActionTypes.SELECT_LAYER, LayersActionTypes.UNSELECT_LAYER)
		.map(() => new ContainerChangedTriggerAction());

	/**
	 * @type Effect
	 * @name annotationUpdateCase$,
	 * @ofType ShowAnnotationsLayerOnInit, ShowAnnotationsLayer, HideAnnotationsLayer, SetAnnotationsLayer
	 * @action UpdateCaseAction
	 */
	@Effect()
	annotationUpdateCase$: Observable<any> = this.actions$
		.ofType<any>(...Object.values(LayersActionTypes.ANNOTATIONS))
		.withLatestFrom(this.store$.select(layersStateSelector), this.store$.select(casesStateSelector))
		.map(([action, layersState, casesState]: [Action, ILayerState, ICasesState]) => {
			const updatedCase = {
				...casesState.selectedCase,
				state: {
					...casesState.selectedCase.state,
					layers: {
						...casesState.selectedCase.state.layers,
						displayAnnotationsLayer: layersState.displayAnnotationsLayer,
						annotationsLayer: layersState.annotationsLayer
					}
				}
			} as Case;
			return new UpdateCaseAction(updatedCase);
		});

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
	}
}
