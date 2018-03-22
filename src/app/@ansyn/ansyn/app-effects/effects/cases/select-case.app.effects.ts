import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { IAppState } from '../../';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/do';
import { Observable } from 'rxjs/Observable';
import { CasesActionTypes, CasesService, SelectCaseAction } from '@ansyn/menu-items';
import { SetComboBoxesProperties } from '@ansyn/status-bar';
import { SetMapsDataActionStore } from '@ansyn/map-facade/actions/map.actions';
import { SetFavoriteOverlaysAction } from '@ansyn/core/actions/core.actions';
import {
	SetAnnotationsLayer,
	ToggleDisplayAnnotationsLayer
} from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { Case, SetLayoutAction, SetOverlaysCriteriaAction } from '@ansyn/core';
import { OverlaysService } from '@ansyn/overlays';
import { UUID } from 'angular2-uuid';

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
		.filter(this.notImageryCountMode.bind(this))
		.mergeMap(({ payload }: SelectCaseAction) => this.selectCaseActions(payload));

	/**
	 * @type Effect
	 * @name selectCaseWithImageryCountBefore$
	 * @ofType SelectCaseAction
	 * @filter There is an imagery count before and the case is not empty
	 * @action ChangeLayoutAction, SetComboBoxesProperties, SetOverlaysCriteriaAction, SetMapsDataActionStore, SetFavoriteOverlaysAction, SetAnnotationsLayer, ToggleDisplayAnnotation
	 */
	@Effect()
	selectCaseWithImageryCountBefore$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE)
		.filter(this.imageryCountBeforeMode.bind(this))
		.switchMap(({ payload }: SelectCaseAction) => {
			return this.overlaysService.getStartDateViaLimitFacets({
				region: payload.state.region,
				limit: this.casesService.contextValues.imageryCountBefore,
				facets: payload.state.facets
			}).mergeMap((data: { startDate, endDate }) => {
				payload.state.time.from = new Date(data.startDate);
				payload.state.time.to = new Date(data.endDate);
				return this.selectCaseActions(payload);
			});
		});

	/**
	 * @type Effect
	 * @name selectCaseWithImageryCountBeforeAndAfter$
	 * @ofType SelectCaseAction
	 * @filter There is an imagery count before and after and the case is not empty
	 * @action UpdateCaseAction, SetTimeAction, LoadOverlaysAction
	 */
	@Effect()
	selectCaseWithImageryCountBeforeAndAfter$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE)
		.filter(this.imageryCountBeforeAfterMode.bind(this))
		.switchMap(({ payload }: SelectCaseAction) => {
			return this.overlaysService.getStartAndEndDateViaRangeFacets({
				region: payload.state.region,
				limitBefore: this.casesService.contextValues.imageryCountBefore,
				limitAfter: this.casesService.contextValues.imageryCountAfter,
				facets: payload.state.facets,
				date: this.casesService.contextValues.time
			})
				.mergeMap((data: { startDate, endDate }) => {
					payload.state.time.from = new Date(data.startDate);
					payload.state.time.to = new Date(data.endDate);
					return this.selectCaseActions(payload);
				});
		});


	notImageryCountMode(): boolean {
		return this.casesService.contextValues.imageryCountBefore === -1 && this.casesService.contextValues.imageryCountAfter === -1;
	}

	imageryCountBeforeMode(): boolean {
		return this.casesService.contextValues.imageryCountBefore !== -1 && this.casesService.contextValues.imageryCountAfter === -1;
	}

	imageryCountBeforeAfterMode(): boolean {
		return this.casesService.contextValues.imageryCountBefore !== -1 && this.casesService.contextValues.imageryCountAfter !== -1;
	}

	selectCaseActions(payload: Case): Action[] {
		const { state } = payload;
		// status-bar
		const { orientation, geoFilter, timeFilter } = state;
		// map
		const { data, activeMapId } = state.maps;
		// core
		const { favoriteOverlays, time, region } = state;
		const { layout } = state.maps;

		if (typeof time.from === 'string') {
			time.from = new Date(time.from);
		}
		if (typeof time.to === 'string') {
			time.to = new Date(time.to);
		}
		// layers
		const { annotationsLayer, displayAnnotationsLayer } = state.layers;
		return [
			new SetLayoutAction(layout),
			new SetComboBoxesProperties({ orientation, geoFilter, timeFilter }),
			new SetOverlaysCriteriaAction({ time, region }),
			new SetMapsDataActionStore({ mapsList: data, activeMapId }),
			new SetFavoriteOverlaysAction(favoriteOverlays),
			new SetAnnotationsLayer(annotationsLayer),
			new ToggleDisplayAnnotationsLayer(displayAnnotationsLayer)
		];
	}


	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected casesService: CasesService,
				protected overlaysService: OverlaysService) {
	}
}
