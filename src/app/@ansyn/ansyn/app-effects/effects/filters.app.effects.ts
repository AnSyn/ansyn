import { Observable } from 'rxjs';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { IAppState } from '../app.effects.module';
import {
	BooleanFilterMetadata,
	EnableOnlyFavoritesSelectionAction,
	EnumFilterMetadata,
	FilterMetadata,
	Filters,
	FiltersActionTypes,
	FiltersService,
	filtersStateSelector,
	IFilter,
	IFiltersState,
	InitializeFiltersAction,
	InitializeFiltersSuccessAction,
	ResetFiltersAction,
	selectFacets,
	selectFilters,
	selectOldFilters,
	selectShowOnlyFavorites
} from '@ansyn/menu-items';
import {
	LoadOverlaysAction,
	LoadOverlaysSuccessAction,
	OverlaysActionTypes,
	overlaysStatusMessages,
	selectFilteredOveralys,
	selectOverlaysArray,
	selectOverlaysMap,
	SetFilteredOverlaysAction,
	SetOverlaysStatusMessage
} from '@ansyn/overlays';
import 'rxjs/add/operator/share';
import 'rxjs/add/observable/of';
import { SetBadgeAction } from '@ansyn/menu';
import {
	buildFilteredOverlays,
	FilterType,
	GenericTypeResolverService,
	ICaseFacetsState,
	ICaseFilter,
	IFilterModel,
	InjectionResolverFilter,
	Overlay,
	selectFavoriteOverlays,
	selectRemovedOverlays,
	selectRemovedOverlaysVisibility
} from '@ansyn/core';
import 'rxjs/add/observable/combineLatest';

@Injectable()
export class FiltersAppEffects {

	filters$: Observable<Filters> = this.store$.select(selectFilters);
	showOnlyFavorite$: Observable<any> = this.store$.select(selectShowOnlyFavorites);
	favoriteOverlays$: Observable<any> = this.store$.select(selectFavoriteOverlays);
	overlaysArray$: Observable<any> = this.store$.select(selectOverlaysArray);
	removedOverlays$: Observable<any> = this.store$.select(selectRemovedOverlays);
	removedOverlaysVisibility$: Observable<any> = this.store$.select(selectRemovedOverlaysVisibility);
	onFiltersChanges$: Observable<[Filters, boolean, Overlay[], string[], boolean]> = Observable.combineLatest(this.filters$, this.showOnlyFavorite$, this.favoriteOverlays$, this.removedOverlays$, this.removedOverlaysVisibility$);
	facets$: Observable<ICaseFacetsState> = this.store$.select(selectFacets);
	oldFilters$: Observable<any> = this.store$.select(selectOldFilters);

	@Effect()
	updateOverlayFilters$ = this.onFiltersChanges$
		.withLatestFrom(this.overlaysArray$)
		.mergeMap(([[filters, showOnlyFavorite, favoriteOverlays, removedOverlaysIds, removedOverlaysVisibility], overlaysArray]: [[Filters, boolean, Overlay[], string[], boolean], Overlay[]]) => {
			const filterModels: IFilterModel[] = FiltersService.pluckFilterModels(filters);
			const filteredOverlays: string[] = buildFilteredOverlays(overlaysArray, filterModels, favoriteOverlays, showOnlyFavorite, removedOverlaysIds, removedOverlaysVisibility);
			const message = (filteredOverlays && filteredOverlays.length) ? overlaysStatusMessages.nullify : overlaysStatusMessages.noOverLayMatchFilters;
			return [
				new SetFilteredOverlaysAction(filteredOverlays),
				new SetOverlaysStatusMessage(message)
			];
		});

	@Effect()
	initializeFilters$: Observable<any> = this.actions$
		.ofType<LoadOverlaysSuccessAction>(OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS)
		.map(() => new InitializeFiltersAction());

	@Effect()
	onInitializeFilters$: Observable<InitializeFiltersSuccessAction> = this.actions$
		.ofType<InitializeFiltersAction>(FiltersActionTypes.INITIALIZE_FILTERS)
		.withLatestFrom(this.oldFilters$, this.overlaysArray$, this.facets$)
		.map(([action, oldFilters, overlays, facets]: [Action, Filters, Overlay[], ICaseFacetsState]) => {
			const filtersConfig: IFilter[] = this.filtersService.getFilters();
			const filters: Map<IFilter, FilterMetadata> = new Map<IFilter, FilterMetadata>();
			const oldFiltersArray = oldFilters ? Array.from(oldFilters) : [];

			filtersConfig.forEach((filter: IFilter) => {
				const metadata: FilterMetadata = this.initializeMetadata(filter, facets);

				overlays.forEach((overlay: any) => {
					metadata.accumulateData(overlay[filter.modelName]);
				});

				metadata.postInitializeFilter({ oldFiltersArray: oldFiltersArray, modelName: filter.modelName });

				const currentFilterInit = facets.filters &&
					facets.filters.find(({ fieldName }) => fieldName === filter.modelName);

				if (!currentFilterInit) {
					metadata.showAll();
				}

				filters.set(filter, metadata);
			});

			return new InitializeFiltersSuccessAction(filters);
		});


	@Effect()
	resetFilters$: Observable<ResetFiltersAction> = this.actions$
		.ofType<LoadOverlaysAction>(OverlaysActionTypes.LOAD_OVERLAYS)
		.map(() => new ResetFiltersAction());


	@Effect()
	updateFiltersBadge$: Observable<any> = this.onFiltersChanges$
		.map(([filters, showOnlyFavorites]: [Filters, boolean, Overlay[], string[], boolean]) => {
			let badge = '0';

			if (showOnlyFavorites) {
				badge = '★';
			} else {
				const filterValues = Array.from(filters.values());
				badge = filterValues.reduce((badgeNum: number, filterMetadata: FilterMetadata) => filterMetadata.isFiltered() ? badgeNum + 1 : badgeNum, 0).toString();
			}

			return new SetBadgeAction({ key: 'Filters', badge });
		})
		.share();

	@Effect()
	setShowFavoritesFlagOnFilters$: Observable<any> = this.favoriteOverlays$
		.map((favoriteOverlays: Overlay[]) => new EnableOnlyFavoritesSelectionAction(Boolean(favoriteOverlays.length)));

	@Effect({ dispatch: false })
	filteredOverlaysChanged$: Observable<any> = this.store$.select(selectFilteredOveralys)
		.withLatestFrom(this.store$.select(filtersStateSelector), this.store$.select(selectOverlaysMap), this.store$.select(selectFavoriteOverlays), this.store$.select(selectRemovedOverlays), this.store$.select(selectRemovedOverlaysVisibility))
		.filter(([filteredOverlays, filterState, overlays]: [string[], IFiltersState, Map<string, Overlay>, Overlay[], string[], boolean]) => {
			return overlays.size > 0;
		})
		.do(([filteredOverlays, filterState, overlays, favoriteOverlays, removedOverlaysIds, removedOverlaysVisibility]: [string[], IFiltersState, Map<string, Overlay>, Overlay[], string[], boolean]) => {

			Array.from(filterState.filters).forEach(([metadataKey, metadata]: [IFilter, FilterMetadata]) => {
				metadata.resetFilteredCount();
				filteredOverlays.forEach((id: string) => {
					const overlay = overlays.get(id);
					metadata.incrementFilteredCount(overlay[metadataKey.modelName]);
				});
				if (metadata instanceof EnumFilterMetadata || metadata instanceof BooleanFilterMetadata) {
					FiltersService.calculatePotentialOverlaysCount(metadataKey, metadata, overlays, favoriteOverlays, removedOverlaysIds, removedOverlaysVisibility, filterState);
				}
			});
		});


	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected genericTypeResolverService: GenericTypeResolverService,
				protected filtersService: FiltersService) {
	}

	initializeMetadata(filter: IFilter, facets: ICaseFacetsState): FilterMetadata {
		const filterType = filter.type;

		const resolveFilterFunction: InjectionResolverFilter = (function wrapperFunction() {
			return function resolverFilteringFunction(filterMetadata: FilterMetadata[]): FilterMetadata {
				return filterMetadata.find((item) => item.type === FilterType[filterType]);
			};
		})();

		const metaData: FilterMetadata =
			this.genericTypeResolverService.resolveMultiInjection(FilterMetadata, resolveFilterFunction, false);

		const currentFilterInit = <ICaseFilter> (facets.filters && facets.filters.find(({ fieldName }) => fieldName === filter.modelName));

		metaData.initializeFilter(currentFilterInit && currentFilterInit.metadata, filter);
		return metaData;
	}
}
