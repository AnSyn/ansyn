import { Inject, Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/do';
import { Observable } from 'rxjs';
import { SetMapsDataActionStore } from '@ansyn/map-facade/actions/map.actions';
import {
	SetFavoriteOverlaysAction,
	SetLayoutAction,
	SetOverlaysCriteriaAction, SetPresetOverlaysAction
} from '@ansyn/core/actions/core.actions';
import {
	BeginLayerCollectionLoadAction,
	UpdateSelectedLayersIds
} from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { CasesActionTypes, SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { ICase, ICaseMapState } from '@ansyn/core/models/case.model';
import { SetComboBoxesProperties } from '@ansyn/status-bar/actions/status-bar.actions';
import { IOverlay } from '@ansyn/core/models/overlay.model';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { IAppState } from '@ansyn/ansyn/app-effects/app.effects.module';
import { UpdateOverlaysManualProcessArgs } from '@ansyn/menu-items/tools/actions/tools.actions';
import { UpdateFacetsAction } from '@ansyn/menu-items/filters/actions/filters.actions';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { SetContextParamsAction } from '@ansyn/context/actions/context.actions';
import { CoreConfig } from '@ansyn/core/models/core.config';
import { ICoreConfig } from '@ansyn/core/models/core.config.model';

@Injectable()
export class SelectCaseAppEffects {

	/**
	 * @type Effect
	 * @name selectCase$
	 * @ofType SelectCaseAction
	 * @action ChangeLayoutAction, SetComboBoxesProperties, SetOverlaysCriteriaAction, SetMapsDataActionStore, SetFavoriteOverlaysAction, ToggleDisplayAnnotation
	 */
	@Effect()
	selectCase$: Observable<any> = this.actions$
		.ofType<SelectCaseAction>(CasesActionTypes.SELECT_CASE)
		.mergeMap(({ payload }: SelectCaseAction) => this.selectCaseActions(payload, this.coreConfig.noInitialSearch));

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				@Inject(CoreConfig) protected coreConfig: ICoreConfig) {
	}

	selectCaseActions(payload: ICase, noInitialSearch: boolean): Action[] {
		const { state } = payload;
		// status-bar
		const { orientation, timeFilter, overlaysManualProcessArgs } = state;
		// map
		const { data, activeMapId } = state.maps;
		// context
		const { favoriteOverlays, presetOverlays, region, dataInputFilters, contextEntities } = state;
		let {  time } = state;
		const { layout } = state.maps;

		if (!time) {
			time = CasesService.defaultTime;
		}

		if (typeof time.from === 'string') {
			time.from = new Date(time.from);
		}
		if (typeof time.to === 'string') {
			time.to = new Date(time.to);
		}
		// layers
		const { activeLayersIds } = state.layers;
		// filters
		const { facets } = state;
		return [
			new SetLayoutAction(<any>layout),
			new SetComboBoxesProperties({ orientation, timeFilter }),
			new SetOverlaysCriteriaAction({ time, region, dataInputFilters}, { noInitialSearch }),
			new SetMapsDataActionStore({ mapsList: data.map(this.parseMapData.bind(this)), activeMapId }),
			new SetFavoriteOverlaysAction(favoriteOverlays.map(this.parseOverlay.bind(this))),
			new SetPresetOverlaysAction((presetOverlays || []).map(this.parseOverlay.bind(this))),
			new BeginLayerCollectionLoadAction(),
			new SetAnnotationsLayer(annotationsLayer),
			new UpdateOverlaysManualProcessArgs({ override: true, data: overlaysManualProcessArgs }),
			new UpdateFacetsAction(facets),
			new UpdateSelectedLayersIds(activeLayersIds),
			new SetContextParamsAction({ contextEntities })
		];
	}

	parseMapData(map: ICaseMapState): ICaseMapState {
		if (map.data.overlay) {
			return { ...map, data: { ...map.data, overlay: this.parseOverlay(map.data.overlay) } };
		}
		return map;
	}

	parseOverlay(overlay: IOverlay): IOverlay {
		return OverlaysService.isFullOverlay(overlay) ? { ...overlay, date: new Date(overlay.date) } : overlay;
	}
}
