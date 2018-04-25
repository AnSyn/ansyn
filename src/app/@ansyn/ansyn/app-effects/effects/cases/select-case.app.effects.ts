import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/do';
import { Observable } from 'rxjs/Observable';
import { SetMapsDataActionStore } from '@ansyn/map-facade/actions/map.actions';
import {
	SetFavoriteOverlaysAction, SetLayoutAction,
	SetOverlaysCriteriaAction
} from '@ansyn/core/actions/core.actions';
import {
	SetAnnotationsLayer,
	ToggleDisplayAnnotationsLayer
} from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { CasesActionTypes, SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { Case, CaseMapState } from '@ansyn/core/models/case.model';
import { SetComboBoxesProperties } from '@ansyn/status-bar/actions/status-bar.actions';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { IAppState } from '@ansyn/ansyn/app-effects/app.effects.module';

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

		const { manualArguments } = state.overlaysManualProcessArgs;

		if (typeof time.from === 'string') {
			time.from = new Date(time.from);
		}
		if (typeof time.to === 'string') {
			time.to = new Date(time.to);
		}

		// layers
		const { annotationsLayer, displayAnnotationsLayer } = state.layers;
		return [
			new SetLayoutAction(<any>layout),
			new SetComboBoxesProperties({ orientation, geoFilter, timeFilter }),
			new SetOverlaysCriteriaAction({ time, region }),
			new SetMapsDataActionStore({ mapsList: data.map(this.parseMapData.bind(this)), activeMapId }),
			new SetFavoriteOverlaysAction(favoriteOverlays.map(this.parseOverlay.bind(this))),
			new SetAnnotationsLayer(annotationsLayer),
			new ToggleDisplayAnnotationsLayer(displayAnnotationsLayer),
			new UpdateImageProcessingHash(manualArguments)
		];
	}

	parseMapData(map: CaseMapState): CaseMapState {
		if (map.data.overlay) {
			return { ...map, data: { ...map.data, overlay: this.parseOverlay(map.data.overlay) } };
		}
		return map;
	}

	parseOverlay(overlay: Overlay): Overlay {
		return OverlaysService.isFullOverlay(overlay) ? { ...overlay, date: new Date(overlay.date) } : overlay;
	}

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected casesService: CasesService,
				protected overlaysService: OverlaysService) {
	}
}
