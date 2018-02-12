import {
	BeginLayerTreeLoadAction, LayersActionTypes, SetAnnotationsLayer,
	ToggleDisplayAnnotationsLayer
} from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { CasesActionTypes, SelectCaseAction, UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/withLatestFrom';
import { isEmpty } from 'lodash';
import { AnnotationVisualizerAgentAction } from '@ansyn/menu-items/tools/actions/tools.actions';
import { IAppState } from '../app.effects.module';
import { ContainerChangedTriggerAction } from '@ansyn/menu/actions/menu.actions';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';


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
		.map(() => new BeginLayerTreeLoadAction());

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
			operation: payload ? 'show' : 'hide', relevantMaps: 'all'
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

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
	}
}
