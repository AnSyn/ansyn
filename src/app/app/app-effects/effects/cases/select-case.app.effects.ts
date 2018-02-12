import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { IAppState } from '../../';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/do';
import { Observable } from 'rxjs/Observable';
import { CasesActionTypes, SelectCaseAction } from '@ansyn/menu-items';
import { ChangeLayoutAction, SetComboBoxesProperties, SetTimeAction } from '@ansyn/status-bar';
import { SetRegionAction } from '@ansyn/map-facade';
import { SetMapsDataActionStore } from '@ansyn/map-facade/actions/map.actions';
import { SetFavoriteOverlaysAction } from '@ansyn/core/actions/core.actions';
import {
	SetAnnotationsLayer,
	ToggleDisplayAnnotationsLayer
} from '@ansyn/menu-items/layers-manager/actions/layers.actions';

@Injectable()
export class SelectCaseAppEffects {

	/**
	 * @type Effect
	 * @name selectCase$
	 * @ofType SelectCaseAction
	 * @action ChangeLayoutAction, SetComboBoxesProperties, SetTimeAction, SetRegionAction, SetMapsDataActionStore, SetFavoriteOverlaysAction, SetAnnotationsLayer, ToggleDisplayAnnotation
	 */
	@Effect()
	selectCase$: Observable<any> = this.actions$
		.ofType<SelectCaseAction>(CasesActionTypes.SELECT_CASE)
		.mergeMap(({ payload }: SelectCaseAction) => {
			const { state } = payload;
			// status-bar
			const { layoutsIndex } = state.maps;
			const { time, orientation, geoFilter, timeFilter } = state;
			// map
			const { region } = state;
			const { data, activeMapId } = state.maps;
			// core
			const { favoriteOverlays } = state;
			// layers
			const { annotationsLayer, displayAnnotationsLayer } = state.layers;

			return [
				new ChangeLayoutAction(+layoutsIndex),
				new SetComboBoxesProperties({ orientation, geoFilter, timeFilter }),
				new SetTimeAction(time),
				new SetRegionAction(region),
				new SetMapsDataActionStore({ mapsList: data, activeMapId }),
				new SetFavoriteOverlaysAction(favoriteOverlays),
				new SetAnnotationsLayer(annotationsLayer),
				new ToggleDisplayAnnotationsLayer(displayAnnotationsLayer),
			];
		}).share();

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>) {
	}
}
