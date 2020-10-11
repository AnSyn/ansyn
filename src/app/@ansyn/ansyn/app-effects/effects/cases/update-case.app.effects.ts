import { Injectable } from '@angular/core';
import { Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, pipe } from 'rxjs';
import { selectActiveMapId, selectLayout, selectMapsList } from '@ansyn/map-facade';
import { filter, map, tap, withLatestFrom } from 'rxjs/operators';
import {
	selectFavoriteOverlays, selectOverlaysManualProcessArgs,
	selectScannedAreaData,
	selectTranslationData
} from '../../../modules/overlays/overlay-status/reducers/overlay-status.reducer';
import { IAppState } from '../../app.effects.module';
import { selectSelectedLayersIds } from '../../../modules/menu-items/layers-manager/reducers/layers.reducer';
import { selectFacets } from '../../../modules/filters/reducer/filters.reducer';
import { UpdateCaseAction } from '../../../modules/menu-items/cases/actions/cases.actions';
import { selectAutoSave, selectSelectedCase } from '../../../modules/menu-items/cases/reducers/cases.reducer';
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
		this.store$.select(selectOverlaysManualProcessArgs),
		this.store$.select(selectMiscOverlays),
		this.store$.select(selectTranslationData),
		this.store$.select(selectScannedAreaData)
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
				activeMapId,
				mapsList,
				layout,
				{ time, region, dataInputFilters }, /* overlaysCriteria */
				overlaysManualProcessArgs,
				miscOverlays,
				overlaysTranslationData,
				overlaysScannedAreaData,
				autoSave,
				schema
			] = events;

			const { id, name, lastModified, creationTime } = selectedCase;

			const updatedCase: ICase = {
				id,
				name,
				creationTime,
				lastModified,
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
					dataInputFilters,
					time,
					facets,
					miscOverlays,
					overlaysManualProcessArgs,
					overlaysTranslationData,
					overlaysScannedAreaData
				},
				schema
			};

			return new UpdateCaseAction({ updatedCase, forceUpdate: this.isAutoSaveTriggered });
		})
	);

	constructor(protected store$: Store<IAppState>) {
	}

}
