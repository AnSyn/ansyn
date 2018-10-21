import { combineLatest, Observable } from 'rxjs';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Inject, Injectable } from '@angular/core';
import { IAppState } from '../app.effects.module';
import {
	EnableOnlyFavoritesSelectionAction,
	FilterMetadata,
	Filters,
	filtersConfig,
	FiltersService,
	filtersStateSelector,
	IFiltersConfig,
	IFiltersState,
	InitializeFiltersAction,
	InitializeFiltersSuccessAction, selectFacets, selectFilters,
	selectShowOnlyFavorites
} from '@ansyn/menu-items';
import {
	LoadOverlaysAction,
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
	buildFilteredOverlays, ICaseFacetsState,
	IFilterModel,
	IOverlay,
	IOverlaySpecialObject,
	mapValuesToArray,
	selectFavoriteOverlays,
	selectRemovedOverlays,
	selectRemovedOverlaysVisibility,
	ICaseFilter
} from '@ansyn/core';
import { filter, map, mergeMap, share, tap, withLatestFrom } from 'rxjs/operators';

@Injectable()
export class FiltersAppEffects {

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
	onFiltersChanges$: Observable<[ICaseFilter[], boolean, IOverlay[], string[], boolean]> = combineLatest(this.filters$, this.showOnlyFavorite$, this.favoriteOverlays$, this.removedOverlays$, this.removedOverlaysVisibility$);
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
	initializeFilters$: Observable<any> = this.actions$.pipe(
		ofType<LoadOverlaysAction>(OverlaysActionTypes.LOAD_OVERLAYS),
		map(() => new InitializeFiltersAction()));

	@Effect()
	onInitializeFilters$: Observable<InitializeFiltersSuccessAction> = this.actions$.pipe(
		ofType<InitializeFiltersAction>(OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS),
		withLatestFrom(this.overlaysArray$),
		map(([action, overlays]: [Action, IOverlay[]]) => {
			const filters = this.filtersService.buildCaseFilters(overlays);
			return new InitializeFiltersSuccessAction({ filters });
		}));

	@Effect()
	updateFiltersBadge$: Observable<any> = this.onFiltersChanges$.pipe(
		map(([showOnlyFavorites]: [Filters, boolean, IOverlay[], string[], boolean]) => {
			let badge = '0';

			if (showOnlyFavorites) {
				badge = '★';
			} else {
				const filterValues = this.filterMetadata;
				badge = filterValues.reduce((badgeNum: number, filterMetadata: FilterMetadata) => badgeNum + filterMetadata.filteredCount(), 0).toString();
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

			// Array.from(filterState.filters).forEach(([metadataKey, metadata]: [IFilter, FilterMetadata]) => {
			// 	metadata.resetFilteredCount();
			// 	filteredOverlays.forEach((id: string) => {
			// 		const overlay = overlays.get(id);
			// 		metadata.incrementFilteredCount(overlay[metadataKey.modelName]);
			// 	});
			// 	if (metadata instanceof EnumFilterMetadata || metadata instanceof BooleanFilterMetadata) {
			// 		FiltersService.calculatePotentialOverlaysCount(metadataKey, metadata, overlays, favoriteOverlays, removedOverlaysIds, removedOverlaysVisibility, filterState);
			// 	}
			// });
		}));


	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				@Inject(FilterMetadata) protected filterMetadata: FilterMetadata[],
				// protected genericTypeResolverService: GenericTypeResolverService,
				protected filtersService: FiltersService,
				@Inject(filtersConfig) protected config: IFiltersConfig) {
	}

	// resolveMetadata(filterType: FilterType): FilterMetadata {
	// 	const resolveFilterFunction: InjectionResolverFilter = (function wrapperFunction() {
	// 		return function resolverFilteringFunction(filterMetadata: FilterMetadata[]): FilterMetadata {
	// 			return filterMetadata.find((item) => item.type === FilterType[filterType]);
	// 		};
	// 	})();
	// 	return this.genericTypeResolverService.resolveMultiInjection(FilterMetadata, resolveFilterFunction, false);
	// }
}
