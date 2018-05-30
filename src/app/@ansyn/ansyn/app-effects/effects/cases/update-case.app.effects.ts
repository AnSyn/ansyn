import { Injectable } from '@angular/core';
import { Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/do';
import { Observable } from 'rxjs/Observable';
import { Case } from '@ansyn/core/models/case.model';
import { UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { IAppState } from '@ansyn/ansyn/app-effects/app.effects.module';
import { selectFacets } from '@ansyn/menu-items/filters/reducer/filters.reducer';
import { selectFavoriteOverlays, selectLayout, selectOverlaysCriteria } from '@ansyn/core/reducers/core.reducer';
import {
	selectAnnotationLayer,
	selectDisplayAnnotationsLayer
} from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { selectActiveMapId, selectMapsList } from '@ansyn/map-facade/reducers/map.reducer';
import { selectOverlaysManualProcessArgs } from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { selectComboBoxesProperties } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { selectSelectedCase } from '@ansyn/menu-items/cases/reducers/cases.reducer';

@Injectable()
export class UpdateCaseAppEffects {
	events: any[] = [
		this.store$.select(selectFacets),
		this.store$.select(selectFavoriteOverlays),
		this.store$.select(selectComboBoxesProperties),
		this.store$.select(selectAnnotationLayer),
		this.store$.select(selectDisplayAnnotationsLayer),
		this.store$.select(selectActiveMapId),
		this.store$.select(selectMapsList),
		this.store$.select(selectLayout),
		this.store$.select(selectOverlaysCriteria),
		this.store$.select(selectOverlaysManualProcessArgs)
	];

	/**
	 * @type Effect
	 * @name caseCollection$
	 * @ofType [...UpdateCaseActionTypes]
	 * @action UpdateCaseAction
	 * @dependencies cases, core, tools, statusBar, map, layers, filters
	 */
	@Effect()
	shouldUpdateCase$ = Observable.combineLatest(this.events)
		.withLatestFrom(this.store$.select(selectSelectedCase))
		.filter(([events, selectedCase]) => Boolean(selectedCase))    /* SelectCaseAction(selectedCase) already triggered */
		.map(([events, selectedCase]: [any, any]) => {
			const [
				facets,
				favoriteOverlays,
				{ geoFilter, timeFilter, orientation }, /* -> comboBoxesProperties */
				annotationsLayer,
				displayAnnotationsLayer,
				activeMapId,
				mapsList,
				layout,
				{ time, region, dataInputFilters }, /* overlaysCriteria */
				overlaysManualProcessArgs
			] = events;

			const { id, name, lastModified, owner, creationTime, selectedContextId } = selectedCase;
			const { contextEntities } = selectedCase.state;

			const updatedCase: Case = {
				id,
				name,
				creationTime,
				lastModified,
				owner,
				selectedContextId,
				state: {
					geoFilter,
					timeFilter,
					orientation,
					maps: {
						layout,
						data: mapsList,
						activeMapId
					},
					layers: {
						annotationsLayer,
						displayAnnotationsLayer
					},
					favoriteOverlays,
					region,
					dataInputFilters,
					time,
					facets,
					contextEntities,
					overlaysManualProcessArgs
				}
			};

			return new UpdateCaseAction(updatedCase);
		});

	constructor(protected store$: Store<IAppState>) {
	}
}
