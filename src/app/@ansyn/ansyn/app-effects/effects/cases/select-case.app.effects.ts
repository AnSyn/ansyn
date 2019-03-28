import { Inject, Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
	CoreConfig,
	ICoreConfig,
	isFullOverlay,
	SetAutoSave,
	SetFavoriteOverlaysAction,
	SetLayoutAction,
	SetOverlaysCriteriaAction,
	SetPresetOverlaysAction,
	SetRemovedOverlaysIdsAction,
	SetRemovedOverlaysVisibilityAction
} from '../../../modules/core/public_api';
import {
	BeginLayerCollectionLoadAction,
	CasesActionTypes,
	CasesService,
	SelectCaseAction, SelectCaseSuccessAction,
	UpdateFacetsAction,
	UpdateOverlaysManualProcessArgs,
	UpdateSelectedLayersIds
} from '../../../modules/menu-items/public_api';
import { SetComboBoxesProperties } from '../../../modules/status-bar/public_api';
import { SetContextParamsAction } from '../../../modules/core/public_api';
import { IAppState } from '../../app.effects.module';
import { ofType } from '@ngrx/effects';
import { concatMap } from 'rxjs/operators';
import { SetActiveMapId, SetMapsDataActionStore } from '@ansyn/map-facade';
import { UUID } from 'angular2-uuid';
import { ICase, ICaseMapState, IOverlay } from '@ansyn/imagery';

@Injectable()
export class SelectCaseAppEffects {

	@Effect()
	selectCase$: Observable<any> = this.actions$.pipe(
		ofType<SelectCaseAction>(CasesActionTypes.SELECT_CASE),
		concatMap(({ payload }: SelectCaseAction) => this.selectCaseActions(payload, this.coreConfig.noInitialSearch))
	);

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				@Inject(CoreConfig) protected coreConfig: ICoreConfig,
				protected casesService: CasesService
				) {
	}

	selectCaseActions(payload: ICase, noInitialSearch: boolean): Action[] {
		const { state, autoSave } = payload;
		// status-bar
		const { orientation, timeFilter, overlaysManualProcessArgs } = state;
		// map
		const { data, activeMapId: currentActiveMapID } = state.maps;
		data.forEach(map => {
			let thisMapId = map.id;
			map.id = UUID.UUID();
			if (thisMapId === currentActiveMapID) {
				state.maps.activeMapId = map.id;
			}
		});
		// context
		const { favoriteOverlays, removedOverlaysIds, removedOverlaysVisibility, presetOverlays, region, dataInputFilters, contextEntities } = state;
		let { time } = state;
		const { layout } = state.maps;

		if (!time) {
			time = this.casesService.defaultTime;
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
			new SetOverlaysCriteriaAction({ time, region, dataInputFilters }, { noInitialSearch }),
			new SetMapsDataActionStore({ mapsList: data.map(this.parseMapData.bind(this)) }),
			new SetActiveMapId(state.maps.activeMapId),
			new SetFavoriteOverlaysAction(favoriteOverlays.map(this.parseOverlay.bind(this))),
			new SetPresetOverlaysAction((presetOverlays || []).map(this.parseOverlay.bind(this))),
			new BeginLayerCollectionLoadAction({ caseId: payload.id }),
			new UpdateOverlaysManualProcessArgs({ override: true, data: overlaysManualProcessArgs }),
			new UpdateFacetsAction(facets),
			new UpdateSelectedLayersIds(activeLayersIds),
			new SetContextParamsAction({ contextEntities }),
			new SetAutoSave(autoSave),
			new SetRemovedOverlaysIdsAction(removedOverlaysIds),
			new SetRemovedOverlaysVisibilityAction(removedOverlaysVisibility),
			new SelectCaseSuccessAction(payload)
		];
	}

	parseMapData(map: ICaseMapState): ICaseMapState {
		if (map.data.overlay) {
			return { ...map, data: { ...map.data, overlay: this.parseOverlay(map.data.overlay) } };
		}
		return map;
	}

	parseOverlay(overlay: IOverlay): IOverlay {
		return isFullOverlay(overlay) ? { ...overlay, date: new Date(overlay.date) } : overlay;
	}
}
