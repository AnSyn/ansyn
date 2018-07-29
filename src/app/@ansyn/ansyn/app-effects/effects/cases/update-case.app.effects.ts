import { Injectable } from '@angular/core';
import { Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ICase } from '@ansyn/core/models/case.model';
import { UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { IAppState } from '@ansyn/ansyn/app-effects/app.effects.module';
import { selectFacets } from '@ansyn/menu-items/filters/reducer/filters.reducer';
import {
	selectFavoriteOverlays,
	selectLayout,
	selectOverlaysCriteria,
	selectPresetOverlays
} from '@ansyn/core/reducers/core.reducer';
import {
	selectDisplayAnnotationsLayer,
	selectSelectedLayersIds
} from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { selectActiveMapId, selectMapsList } from '@ansyn/map-facade/reducers/map.reducer';
import { selectOverlaysManualProcessArgs } from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { selectComboBoxesProperties } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { selectSelectedCase } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { selectContextEntities } from '@ansyn/context/reducers/context.reducer';

@Injectable()
export class UpdateCaseAppEffects {
	events: any[] = [
		this.store$.select(selectSelectedLayersIds),
		this.store$.select(selectFacets),
		this.store$.select(selectFavoriteOverlays),
		this.store$.select(selectPresetOverlays),
		this.store$.select(selectComboBoxesProperties),
		this.store$.select(selectDisplayAnnotationsLayer),
		this.store$.select(selectActiveMapId),
		this.store$.select(selectMapsList),
		this.store$.select(selectLayout),
		this.store$.select(selectOverlaysCriteria),
		this.store$.select(selectOverlaysManualProcessArgs),
		this.store$.select(selectContextEntities)
	];

	/**
	 * @type Effect
	 * @name caseCollection$
	 * @ofType [...UpdateCaseActionTypes]
	 * @action UpdateCaseAction
	 * @dependencies cases, core, tools, statusBar, map, layers, filters
	 */
	@Effect()
	shouldUpdateCase$ = combineLatest(this.events)
		.withLatestFrom(this.store$.select(selectSelectedCase))
		.filter(([events, selectedCase]) => Boolean(selectedCase))    /* SelectCaseAction(selectedCase) already triggered */
		.map(([events, selectedCase]: [any, any]) => {
			const [
				activeLayersIds,
				facets,
				favoriteOverlays,
				presetOverlays,
				{ timeFilter, orientation }, /* -> comboBoxesProperties */
				displayAnnotationsLayer,
				activeMapId,
				mapsList,
				layout,
				{ time, region, dataInputFilters }, /* overlaysCriteria */
				overlaysManualProcessArgs,
				contextEntities
			] = events;

			const { id, name, lastModified, owner, creationTime, selectedContextId, autoSave } = selectedCase;

			const updatedCase: ICase = {
				id,
				name,
				creationTime,
				lastModified,
				owner,
				selectedContextId,
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
					presetOverlays,
					region,
					dataInputFilters,
					time,
					facets,
					contextEntities,
					overlaysManualProcessArgs
				}
			};

			return new UpdateCaseAction({ updatedCase });
		});

	constructor(protected store$: Store<IAppState>) {
	}
}
