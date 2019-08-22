import { Injectable } from '@angular/core';
import { Effect } from '@ngrx/effects';
import { Store, createFeatureSelector, createSelector } from '@ngrx/store';
import { combineLatest, pipe, Observable } from 'rxjs';
import {
	selectActiveMapId, selectLayout, selectMapsList
} from '@ansyn/map-facade';
import { filter, tap, withLatestFrom, map } from 'rxjs/operators';
import {
	selectFavoriteOverlays,
	selectPresetOverlays,
	selectRemovedOverlays,
	selectRemovedOverlaysVisibility,
	selectTranslationData
} from '../../../modules/overlays/overlay-status/reducers/overlay-status.reducer';
import { IAppState } from '../../app.effects.module';
import { selectSelectedLayersIds } from '../../../modules/menu-items/layers-manager/reducers/layers.reducer';
import { selectFacets } from '../../../modules/menu-items/filters/reducer/filters.reducer';
import { selectComboBoxesProperties } from '../../../modules/status-bar/reducers/status-bar.reducer';
import { selectOverlaysManualProcessArgs } from '../../../modules/menu-items/tools/reducers/tools.reducer';
import { UpdateCaseAction } from '../../../modules/menu-items/cases/actions/cases.actions';
import { selectAutoSave, selectSelectedCase } from '../../../modules/menu-items/cases/reducers/cases.reducer';
import { selectMiscOverlays, selectOverlaysCriteria } from '../../../modules/overlays/reducers/overlays.reducer';
import { ICase } from '../../../modules/menu-items/cases/models/case.model';

// @todo refactor
const contextFeatureSelector = createFeatureSelector('context');
const selectContextsParams = createSelector(contextFeatureSelector, (context: any) => context && context.params);
const selectContextEntities = createSelector(selectContextsParams, (params: any) => params && params.contextEntities);

@Injectable()
export class UpdateCaseAppEffects {
	isAutoSaveTriggered: boolean;
	clearIsAutoSave: any = pipe(tap(() => this.isAutoSaveTriggered = false));
	setIsAutoSave: any = pipe(tap(() => this.isAutoSaveTriggered = true));

	events: any[] = [
		this.store$.select(selectSelectedLayersIds),
		this.store$.select(selectFacets),
		this.store$.select(selectFavoriteOverlays),
		this.store$.select(selectRemovedOverlays),
		this.store$.select(selectRemovedOverlaysVisibility),
		this.store$.select(selectPresetOverlays),
		this.store$.select(selectComboBoxesProperties),
		this.store$.select(selectActiveMapId),
		this.store$.select(selectMapsList),
		this.store$.select(selectLayout),
		this.store$.select(selectOverlaysCriteria),
		this.store$.select(selectOverlaysManualProcessArgs),
		this.store$.select(selectContextEntities),
		this.store$.select(selectMiscOverlays),
		this.store$.select(selectTranslationData)
	]
		.map(event => event.pipe(this.clearIsAutoSave))
		.concat([this.store$.select(selectAutoSave).pipe(this.setIsAutoSave)]);

	@Effect()
	shouldUpdateCase$: Observable<UpdateCaseAction> = combineLatest(this.events).pipe(
		withLatestFrom(this.store$.select(selectSelectedCase)),
		filter(([events, selectedCase]) => Boolean(selectedCase)), /* SelectCaseAction(selectedCase) already triggered */
		map(([events, selectedCase]: [any, any]) => {
			const [
				activeLayersIds,
				facets,
				favoriteOverlays,
				removedOverlaysIds,
				removedOverlaysVisibility,
				presetOverlays,
				{ timeFilter, orientation }, /* -> comboBoxesProperties */
				activeMapId,
				mapsList,
				layout,
				{ time, region, dataInputFilters }, /* overlaysCriteria */
				overlaysManualProcessArgs,
				contextEntities,
				miscOverlays,
				overlaysTranslationData,
				autoSave
			] = events;

			const { id, name, lastModified, creationTime, selectedContextId } = selectedCase;

			const updatedCase: ICase = {
				id,
				name,
				creationTime,
				lastModified,
				autoSave,
				state: {
					timeFilter,
					orientation,
					maps: {
						layout,
						data: mapsList,
						activeMapId
					},
					layers: {
						activeLayersIds
					},
					favoriteOverlays,
					removedOverlaysIds,
					removedOverlaysVisibility,
					presetOverlays,
					region,
					dataInputFilters,
					time,
					facets,
					contextEntities,
					miscOverlays,
					overlaysManualProcessArgs,
					overlaysTranslationData
				}
			};

			return new UpdateCaseAction({ updatedCase, forceUpdate: this.isAutoSaveTriggered });
		})
	);

	constructor(protected store$: Store<IAppState>) {
	}

}
