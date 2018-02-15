import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { IAppState } from '../../';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/do';
import { Observable } from 'rxjs/Observable';
import { CasesActionTypes, SelectCaseAction } from '@ansyn/menu-items';
import { ChangeLayoutAction, SetComboBoxesProperties } from '@ansyn/status-bar';
import { SetMapsDataActionStore } from '@ansyn/map-facade/actions/map.actions';
import { SetFavoriteOverlaysAction } from '@ansyn/core/actions/core.actions';
import {
	SetAnnotationsLayer,
	ToggleDisplayAnnotationsLayer
} from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { SetOverlaysCriteriaAction } from '@ansyn/core';

@Injectable()
export class SelectCaseAppEffects {

	/**
	 * @type Effect
	 * @name selectCase$
	 * @ofType SelectCaseAction
	 * @action ChangeLayoutAction, SetComboBoxesProperties, SetOverlaysCriteriaAction, SetMapsDataActionStore, SetFavoriteOverlaysAction, SetAnnotationsLayer, ToggleDisplayAnnotation
	 */
	@Effect()
	selectCase$: Observable<any> = this.actions$
		.ofType<SelectCaseAction>(CasesActionTypes.SELECT_CASE)
		.mergeMap(({ payload }: SelectCaseAction) => {
			const { state } = payload;
			// status-bar
			const { layoutsIndex } = state.maps;
			const { orientation, geoFilter, timeFilter } = state;
			// map
			const { data, activeMapId } = state.maps;
			// core
			const { favoriteOverlays, time, region } = state;
			if (typeof time.from === 'string') {
				time.from = new Date(time.from);
			}
			if (typeof time.to === 'string') {
				time.to = new Date(time.to);
			}

			// layers
			const { annotationsLayer, displayAnnotationsLayer } = state.layers;
			return [
				new ChangeLayoutAction(+layoutsIndex),
				new SetComboBoxesProperties({ orientation, geoFilter, timeFilter }),
				new SetOverlaysCriteriaAction({ time, region }),
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
