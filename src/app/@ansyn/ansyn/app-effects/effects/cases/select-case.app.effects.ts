import { Inject, Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
	SetFavoriteOverlaysAction,
	SetOverlaysScannedAreaDataAction,
	SetOverlaysTranslationDataAction,
	UpdateOverlaysManualProcessArgs
} from '../../../modules/overlays/overlay-status/actions/overlay-status.actions';
import { IAppState } from '../../app.effects.module';
import { concatMap } from 'rxjs/operators';
import { SetActiveMapId, SetLayoutAction, SetMapsDataActionStore } from '@ansyn/map-facade';
import {
	BeginLayerCollectionLoadAction,
	UpdateSelectedLayersIds
} from '../../../modules/menu-items/layers-manager/actions/layers.actions';
import {
	CasesActionTypes,
	SelectCaseAction,
	SelectCaseSuccessAction,
	SetAutoSave
} from '../../../modules/menu-items/cases/actions/cases.actions';
import { casesConfig, CasesService } from '../../../modules/menu-items/cases/services/cases.service';
import { UpdateFacetsAction } from '../../../modules/filters/actions/filters.actions';
import {
	SetAnnotationMode,
	SetMeasureDistanceToolState,
} from '../../../modules/menu-items/tools/actions/tools.actions';
import { isFullOverlay } from '../../../modules/core/utils/overlays';
import { ICoreConfig } from '../../../modules/core/models/core.config.model';
import { CoreConfig } from '../../../modules/core/models/core.config';
import { SetMiscOverlays, SetOverlaysCriteriaAction } from '../../../modules/overlays/actions/overlays.actions';
import { ICase, ICaseMapState } from '../../../modules/menu-items/cases/models/case.model';
import { IOverlay } from '../../../modules/overlays/models/overlay.model';
import { mapValues } from 'lodash';
import { ICasesConfig } from '../../../modules/menu-items/cases/models/cases-config';
import { UpdateGeoFilterStatus } from '../../../modules/status-bar/actions/status-bar.actions';

@Injectable()
export class SelectCaseAppEffects {

	@Effect()
	selectCase$: Observable<any> = this.actions$.pipe(
		ofType<SelectCaseAction>(CasesActionTypes.SELECT_CASE),
		concatMap<any, any>(({ payload }: SelectCaseAction) => this.selectCaseActions(payload, this.coreConfig.noInitialSearch))
	);

	constructor(protected actions$: Actions,
		protected store$: Store<IAppState>,
		@Inject(CoreConfig) protected coreConfig: ICoreConfig,
		@Inject(casesConfig) public caseConfig: ICasesConfig,
		protected casesService: CasesService
	) {
	}

	selectCaseActions(payload: ICase, noInitialSearch: boolean): Action[] {
		const { state, autoSave } = payload;
		// status-bar
		const { overlaysManualProcessArgs, overlaysTranslationData, overlaysScannedAreaData } = state;
		// map
		const { data } = state.maps;
		// context
		const { favoriteOverlays, region, dataInputFilters, miscOverlays } = state;

		const { layout } = state.maps;

		const searchMode = state.searchMode ? state.searchMode : region.type;

		let time = state.time ? { ...state.time } : this.casesService.defaultTime;

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

		const selectCaseAction = [
			new SetMapsDataActionStore({ mapsList: data.map(this.parseMapData.bind(this)) }),
			new SetActiveMapId(state.maps.activeMapId),
			new SetLayoutAction(<any>layout),
			new SetOverlaysCriteriaAction({ time, region, dataInputFilters, searchMode }, { noInitialSearch }),
			new UpdateGeoFilterStatus({ active: false, type: searchMode }),
			new SetFavoriteOverlaysAction(favoriteOverlays.map(this.parseOverlay.bind(this))),
			new SetMiscOverlays({ miscOverlays: mapValues(miscOverlays || {}, this.parseOverlay.bind(this)) }),
			new SetOverlaysTranslationDataAction(overlaysTranslationData),
			new SetOverlaysScannedAreaDataAction(overlaysScannedAreaData),
			new BeginLayerCollectionLoadAction({ caseId: payload.id }),
			new UpdateOverlaysManualProcessArgs({ override: true, data: overlaysManualProcessArgs }),
			new UpdateFacetsAction(facets),
			new UpdateSelectedLayersIds(activeLayersIds),
			new SetAutoSave(autoSave),
			new SetAnnotationMode(null),
			new SetMeasureDistanceToolState(false),
			new SelectCaseSuccessAction(payload)
		];

		return selectCaseAction;
	}

	parseMapData(map: ICaseMapState): ICaseMapState {
		const newMap = { ...map };
		// check overlayDisplayMode for old case
		if ((newMap.data as any).overlayDisplayMode !== undefined) {
			newMap.data.overlaysFootprintActive = (newMap.data as any).overlayDisplayMode === 'Polygon';
			delete (newMap.data as any).overlayDisplayMode;
		}
		return newMap;
	}

	parseOverlay(overlay: IOverlay): IOverlay {
		return isFullOverlay(overlay) ? overlay : { ...overlay, date: new Date(overlay.date) };
	}
}
