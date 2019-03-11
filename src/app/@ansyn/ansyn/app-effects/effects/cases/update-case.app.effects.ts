import { Injectable } from '@angular/core';
import { Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, pipe, EMPTY, of } from 'rxjs';
import {
	ICase,
	selectAutoSave,
	selectFavoriteOverlays,
	selectLayout,
	selectOverlaysCriteria,
	selectPresetOverlays,
	selectRemovedOverlays,
	selectRemovedOverlaysVisibility
} from '@ansyn/core';
import {
	casesStateSelector,
	selectFacets,
	selectOverlaysManualProcessArgs,
	selectSelectedCase,
	selectSelectedLayersIds,
	UpdateCaseAction
} from '@ansyn/menu-items';
import { selectActiveMapId, selectMapsList } from '@ansyn/map-facade';
import { selectComboBoxesProperties } from '@ansyn/status-bar';
import { selectContextEntities } from '@ansyn/context';
import { filter, map, tap, withLatestFrom, mergeMap } from 'rxjs/operators';
import { IAppState } from '../../app.effects.module';
import { isEqual as _isEqual, cloneDeep as _cloneDeep } from 'lodash';

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
		this.store$.select(selectContextEntities)
	]
		.map(event => event.pipe(this.clearIsAutoSave))
		.concat([this.store$.select(selectAutoSave).pipe(this.setIsAutoSave)]);

	@Effect()
	shouldUpdateCase$: any = combineLatest(this.events).pipe(
		withLatestFrom(this.store$.select(selectSelectedCase), this.store$.select(casesStateSelector)),
		filter(([events, selectedCase, cases]) => Boolean(selectedCase)), /* SelectCaseAction(selectedCase) already triggered */
		mergeMap(([events, selectedCase, cases]: [any, any, any]) => {
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
					overlaysManualProcessArgs
				}
			};

			if (this.isEqualCases(selectedCase, updatedCase)) {
				return EMPTY;
			}

			return of(new UpdateCaseAction({ updatedCase, forceUpdate: this.isAutoSaveTriggered }));
		})
	);

	constructor(protected store$: Store<IAppState>) {
	}

	protected isEqualCases(caseA, caseB) {
		return _isEqual(JSON.parse(JSON.stringify(caseA)), JSON.parse(JSON.stringify(caseB)))
	}

}
