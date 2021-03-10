import { Injectable } from '@angular/core';
import { Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, pipe } from 'rxjs';
import { selectActiveMapId, selectLayout, selectMapsList, selectFourViewsData } from '@ansyn/map-facade';
import { filter, map, tap, withLatestFrom } from 'rxjs/operators';
import {
	selectFavoriteOverlays, selectOverlaysImageProcess,
	selectScannedAreaData,
	selectTranslationData
} from '../../../modules/overlays/overlay-status/reducers/overlay-status.reducer';
import { IAppState } from '../../app.effects.module';
import { selectSelectedLayersIds } from '../../../modules/menu-items/layers-manager/reducers/layers.reducer';
import { selectFacets } from '../../../modules/filters/reducer/filters.reducer';
import { UpdateCaseAction } from '../../../modules/menu-items/cases/actions/cases.actions';
import { selectSelectedCase } from '../../../modules/menu-items/cases/reducers/cases.reducer';
import { selectMiscOverlays, selectOverlaysCriteria } from '../../../modules/overlays/reducers/overlays.reducer';
import { ICase } from '../../../modules/menu-items/cases/models/case.model';

@Injectable()
export class UpdateCaseAppEffects {
	isAutoSaveTriggered: boolean;
	clearIsAutoSave: any = pipe(tap(() => this.isAutoSaveTriggered = false));
	setIsAutoSave: any = pipe(tap(() => this.isAutoSaveTriggered = true));

	events: any[] = [
		this.store$.select(selectSelectedLayersIds),
		this.store$.select(selectFacets),
		this.store$.select(selectFavoriteOverlays),
		this.store$.select(selectActiveMapId),
		this.store$.select(selectMapsList),
		this.store$.select(selectLayout),
		this.store$.select(selectOverlaysCriteria),
		this.store$.select(selectOverlaysImageProcess),
		this.store$.select(selectMiscOverlays),
		this.store$.select(selectTranslationData),
		this.store$.select(selectScannedAreaData),
		this.store$.select(selectFourViewsData)
	];

	@Effect()
	shouldUpdateCase$: Observable<UpdateCaseAction> = combineLatest(this.events).pipe(
		withLatestFrom(this.store$.select(selectSelectedCase)),
		filter(([events, selectedCase]) => Boolean(selectedCase)), /* SelectCaseAction(selectedCase) already triggered */
		map(([events, selectedCase]: [any, any]) => {
			const [
				activeLayersIds,
				facets,
				favoriteOverlays,
				activeMapId,
				mapsList,
				layout,
				{ time, region, dataInputFilters, advancedSearchParameters }, /* overlaysCriteria */
				overlaysImageProcess,
				miscOverlays,
				overlaysTranslationData,
				overlaysScannedAreaData,
				fourViewsMode
			] = events;

			const { id, name, creationTime } = selectedCase;
			const autoSave = false; // Todo: placeholder

			const updatedCase: ICase = {
				id,
				name,
				creationTime,
				autoSave,
				state: {
					maps: {
						layout,
						data: mapsList,
						activeMapId
					},
					layers: {
						activeLayersIds
					},
					favoriteOverlays,
					region,
					time,
					advancedSearchParameters,
					fourViewsMode,
					facets,
					miscOverlays,
					overlaysImageProcess,
					overlaysTranslationData,
					overlaysScannedAreaData
				}
			};

			return new UpdateCaseAction( updatedCase);
		})
	);

	constructor(protected store$: Store<IAppState>) {
	}

}
