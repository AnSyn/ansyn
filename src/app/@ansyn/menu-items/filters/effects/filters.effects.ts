import { combineLatest, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Inject, Injectable } from '@angular/core';

import {
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
	ICaseFilter,
	IOverlay,
	IOverlaySpecialObject,
	mapValuesToArray,
	selectFavoriteOverlays,
	selectRemovedOverlays,
	selectRemovedOverlaysVisibility
} from '@ansyn/core';
import { map, mergeMap, share } from 'rxjs/operators';
import { FiltersService } from '../services/filters.service';
import { filtersConfig, IFiltersConfig } from '../models/filters-config';
import { EnableOnlyFavoritesSelectionAction } from '../actions/filters.actions';
import { Filters, selectFilters, selectShowOnlyFavorites } from '../reducer/filters.reducer';

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
	forOverlayDrops$: Observable<[Map<string, IOverlay>, string[], Map<string, IOverlaySpecialObject>, IOverlay[], boolean]> = combineLatest(
		this.overlaysMap$, this.filteredOverlays$, this.specialObjects$, this.favoriteOverlays$, this.showOnlyFavorite$);


	@Effect()
	updateOverlayFilters$ = combineLatest(
		this.filters$,
		this.overlaysArray$,
		this.removedOverlays$,
		this.removedOverlaysVisibility$
	).pipe(
		mergeMap(([filters, overlaysArray, removedOverlaysIds, removedOverlaysVisibility]: [ICaseFilter[], IOverlay[], string[], boolean]) => {
			const filteredOverlays: string[] = this.filtersService.buildFilteredOverlays(overlaysArray, removedOverlaysIds, removedOverlaysVisibility);
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
				badge = this.filtersService.getFilteredCount().toString();
			}

			return new SetBadgeAction({ key: 'Filters', badge });
		}),
		share()
	);

	@Effect()
	setShowFavoritesFlagOnFilters$: Observable<any> = this.favoriteOverlays$.pipe(
		map((favoriteOverlays: IOverlay[]) => new EnableOnlyFavoritesSelectionAction(Boolean(favoriteOverlays.length))));

	constructor(protected actions$: Actions,
				protected store$: Store<any>,
				protected filtersService: FiltersService,
				@Inject(filtersConfig) protected config: IFiltersConfig) {
	}
}
