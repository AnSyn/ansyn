import { combineLatest, Observable } from 'rxjs';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Inject, Injectable } from '@angular/core';

import {
	LoadOverlaysSuccessAction,
	OverlaysActionTypes,
	OverlaysService,
	overlaysStatusMessages,
	selectFilteredOveralys,
	selectOverlaysArray,
	selectOverlaysMap,
	selectSpecialObjects,
	SetDropsAction,
	SetFilteredOverlaysAction,
	SetOverlaysStatusMessage
} from '@ansyn/overlays';
import { SetBadgeAction } from '@ansyn/menu';
import {
	buildFilteredOverlays,
	ICaseFilter,
	IFilterModel,
	IOverlay,
	IOverlaySpecialObject,
	mapValuesToArray,
	selectFavoriteOverlays,
	selectRemovedOverlays,
	selectRemovedOverlaysVisibility
} from '@ansyn/core';
import { filter, map, mergeMap, share, tap, withLatestFrom } from 'rxjs/operators';
import { filtersConfig, FiltersService } from '../services/filters.service';
import { FilterMetadata } from '../models/metadata/filter-metadata.interface';
import { BooleanFilterMetadata } from '../models/metadata/boolean-filter-metadata';
import { EnumFilterMetadata } from '../models/metadata/enum-filter-metadata';
import { IFiltersConfig } from '../models/filters-config';
import { EnableOnlyFavoritesSelectionAction } from '../actions/filters.actions';
import {
	Filters,
	filtersStateSelector,
	IFiltersState,
	selectFilters,
	selectShowOnlyFavorites
} from '../reducer/filters.reducer';

@Injectable()
export class FiltersEffects {

	// facets$: Observable<ICaseFacetsState> = this.store$.select(selectFacets);
	filters$: Observable<ICaseFilter[]> = this.store$.select(selectFilters);
	showOnlyFavorite$: Observable<boolean> = this.store$.select(selectShowOnlyFavorites);
	favoriteOverlays$: Observable<IOverlay[]> = this.store$.select(selectFavoriteOverlays);
	overlaysMap$: Observable<Map<string, IOverlay>> = this.store$.select(selectOverlaysMap);
	overlaysArray$: Observable<IOverlay[]> = this.store$.select(selectOverlaysArray);
	filteredOverlays$: Observable<string[]> = this.store$.select(selectFilteredOveralys);
	specialObjects$: Observable<Map<string, IOverlaySpecialObject>> = this.store$.select(selectSpecialObjects);
	removedOverlays$: Observable<any> = this.store$.select(selectRemovedOverlays);
	removedOverlaysVisibility$: Observable<any> = this.store$.select(selectRemovedOverlaysVisibility);
	onFiltersChanges$: Observable<[boolean, ICaseFilter[], IOverlay[], string[], boolean]> = combineLatest(this.showOnlyFavorite$, this.filters$, this.favoriteOverlays$, this.removedOverlays$, this.removedOverlaysVisibility$);
	onCriterialFiltersChanges$: Observable<[ICaseFilter[], string[], boolean]> = combineLatest(this.filters$, this.removedOverlays$, this.removedOverlaysVisibility$);
	forOverlayDrops$: Observable<[Map<string, IOverlay>, string[], Map<string, IOverlaySpecialObject>, IOverlay[], boolean]> = combineLatest(
		this.overlaysMap$, this.filteredOverlays$, this.specialObjects$, this.favoriteOverlays$, this.showOnlyFavorite$);


	@Effect()
	updateOverlayFilters$ = this.onCriterialFiltersChanges$.pipe(
		withLatestFrom(this.overlaysArray$),
		mergeMap(([[filters, removedOverlaysIds, removedOverlaysVisibility], overlaysArray]: [[ICaseFilter[], string[], boolean], IOverlay[]]) => {
			const filterModels: IFilterModel[] = FiltersService.pluckFilterModels(this.filterMetadata);
			const filteredOverlays: string[] = buildFilteredOverlays(overlaysArray, filterModels, removedOverlaysIds, removedOverlaysVisibility);
			const message = (filteredOverlays && filteredOverlays.length) ? overlaysStatusMessages.nullify : overlaysStatusMessages.noOverLayMatchFilters;
			return [
				new SetFilteredOverlaysAction(filteredOverlays),
				new SetOverlaysStatusMessage(message)
			];
		}));

	@Effect()
	updateOverlayDrops$ = this.forOverlayDrops$.pipe(
		map(([overlaysMap, filteredOverlays, specialObjects, favoriteOverlays, showOnlyFavorites]: [Map<string, IOverlay>, string[], Map<string, IOverlaySpecialObject>, IOverlay[], boolean]) => {
			const drops = OverlaysService.parseOverlayDataForDisplay({
				overlaysArray: mapValuesToArray(overlaysMap),
				filteredOverlays,
				specialObjects,
				favoriteOverlays,
				showOnlyFavorites
			});
			return new SetDropsAction(drops);
		})
	);

	@Effect()
	updateFiltersBadge$: Observable<any> = this.onFiltersChanges$.pipe(
		map(([showOnlyFavorites]: [boolean, ICaseFilter[], IOverlay[], string[], boolean]) => {
			let badge = '0';

			if (showOnlyFavorites) {
				badge = '★';
			} else {
				badge = this.filterMetadata.reduce((badgeNum: number, filterMetadata: FilterMetadata) => badgeNum + filterMetadata.filteredCount(), 0).toString();
			}

			return new SetBadgeAction({ key: 'Filters', badge });
		}),
		share()
	);

	@Effect()
	setShowFavoritesFlagOnFilters$: Observable<any> = this.favoriteOverlays$.pipe(
		map((favoriteOverlays: IOverlay[]) => new EnableOnlyFavoritesSelectionAction(Boolean(favoriteOverlays.length))));

	@Effect({ dispatch: false })
	filteredOverlaysChanged$: Observable<any> = this.store$.select(selectFilteredOveralys).pipe(
		withLatestFrom(this.store$.select(filtersStateSelector), this.store$.select(selectOverlaysMap), this.store$.select(selectFavoriteOverlays), this.store$.select(selectRemovedOverlays), this.store$.select(selectRemovedOverlaysVisibility)),
		filter(([filteredOverlays, filterState, overlays]: [string[], IFiltersState, Map<string, IOverlay>, IOverlay[], string[], boolean]) => {
			return overlays.size > 0;
		}),
		tap(([filteredOverlays, filterState, overlays, favoriteOverlays, removedOverlaysIds, removedOverlaysVisibility]: [string[], IFiltersState, Map<string, IOverlay>, IOverlay[], string[], boolean]) => {
			this.filterMetadata.forEach((metadata: FilterMetadata) => {
				Object.keys(metadata.models).forEach((model) => {
					metadata.resetFilteredCount(model);
					filteredOverlays.forEach((id: string) => {
						const overlay = overlays.get(id);
						metadata.incrementFilteredCount(model, overlay[model]);
					});
					if (metadata instanceof EnumFilterMetadata || metadata instanceof BooleanFilterMetadata) {
						FiltersService.calculatePotentialOverlaysCount(model, metadata, overlays, favoriteOverlays, removedOverlaysIds, removedOverlaysVisibility, filterState);
					}
				});
			});
		}));


	constructor(protected actions$: Actions,
				protected store$: Store<any>,
				@Inject(FilterMetadata) protected filterMetadata: FilterMetadata[],
				protected filtersService: FiltersService,
				@Inject(filtersConfig) protected config: IFiltersConfig) {
	}
}
