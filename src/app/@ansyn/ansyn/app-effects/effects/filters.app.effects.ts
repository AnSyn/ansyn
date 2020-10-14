import { combineLatest, Observable, of } from 'rxjs';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Inject, Injectable } from '@angular/core';
import {
	selectFavoriteOverlays,
} from '../../modules/overlays/overlay-status/reducers/overlay-status.reducer';
import { IAppState } from '../app.effects.module';
import { SetBadgeAction } from '@ansyn/menu';
import { catchError, distinctUntilChanged, filter, map, mergeMap, share, withLatestFrom } from 'rxjs/operators';
import { BooleanFilterMetadata } from '../../modules/filters/models/metadata/boolean-filter-metadata';
import {
	EnableOnlyFavoritesSelectionAction,
	InitializeFiltersAction,
	InitializeFiltersSuccessAction,
	UpdateFiltersCounters,
	LogFilters
} from '../../modules/filters/actions/filters.actions';
import { EnumFilterMetadata } from '../../modules/filters/models/metadata/enum-filter-metadata';
import { FilterMetadata } from '../../modules/filters/models/metadata/filter-metadata.interface';
import {
	FiltersMetadata,
	filtersStateSelector,
	filtersToString,
	IFiltersState,
	selectFacets,
	selectFiltersMetadata,
	selectShowOnlyFavorites
} from '../../modules/filters/reducer/filters.reducer';
import { filtersConfig, FiltersService } from '../../modules/filters/services/filters.service';
import { IFilter } from '../../modules/filters/models/IFilter';
import { IFiltersConfig } from '../../modules/filters/models/filters-config';
import { buildFilteredOverlays } from '../../modules/core/utils/overlays';
import { GenericTypeResolverService } from '../../modules/core/services/generic-type-resolver.service';
import { IFilterModel } from '../../modules/core/models/IFilterModel';
import { InjectionResolverFilter } from '../../modules/core/services/generic-type-resolver';
import { mapValuesToArray } from '../../modules/core/utils/misc';
import {
	LoadOverlaysAction,
	OverlaysActionTypes,
	SetDropsAction,
	SetFilteredOverlaysAction,
	SetOverlaysStatusMessageAction,
	SetTotalOverlaysAction
} from '../../modules/overlays/actions/overlays.actions';
import {
	overlaysStatusMessages,
	selectDrops,
	selectFilteredOveralys,
	selectOverlaysAreLoaded,
	selectOverlaysArray,
	selectOverlaysContainmentChecked,
	selectOverlaysMap,
	selectSpecialObjects
} from '../../modules/overlays/reducers/overlays.reducer';
import { OverlaysService } from '../../modules/overlays/services/overlays.service';
import { FilterType } from '../../modules/filters/models/filter-type';
import { ICaseFacetsState } from '../../modules/menu-items/cases/models/case.model';
import { IOverlay, IOverlayDrop, IOverlaySpecialObject } from '../../modules/overlays/models/overlay.model';
import { cloneDeep, get as _get, isEqual } from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { FilterCounters } from '../../modules/filters/models/counters/filter-counters.interface';

@Injectable()
export class FiltersAppEffects {

	filtersMetadata$: Observable<FiltersMetadata> = this.store$.select(selectFiltersMetadata);
	showOnlyFavorite$: Observable<boolean> = this.store$.select(selectShowOnlyFavorites);
	favoriteOverlays$: Observable<IOverlay[]> = this.store$.select(selectFavoriteOverlays);
	overlaysMap$: Observable<Map<string, IOverlay>> = this.store$.select(selectOverlaysMap);
	overlaysArray$: Observable<IOverlay[]> = this.store$.select(selectOverlaysArray);
	filteredOverlays$: Observable<string[]> = this.store$.select(selectFilteredOveralys);
	specialObjects$: Observable<Map<string, IOverlaySpecialObject>> = this.store$.select(selectSpecialObjects);
	onFiltersChanges$: Observable<[FiltersMetadata, boolean, IOverlay[]]> = combineLatest([this.filtersMetadata$, this.showOnlyFavorite$, this.favoriteOverlays$]);
	forOverlayDrops$: Observable<[Map<string, IOverlay>, string[], Map<string, IOverlaySpecialObject>, IOverlay[], boolean]> = combineLatest([
		this.overlaysMap$, this.filteredOverlays$, this.specialObjects$, this.favoriteOverlays$, this.showOnlyFavorite$]);
	facets$: Observable<ICaseFacetsState> = this.store$.select(selectFacets);
	onFiltersChangesForLog$: Observable<[FiltersMetadata, boolean]> = combineLatest([this.filtersMetadata$, this.showOnlyFavorite$]);

	@Effect()
	filtersLogger$: Observable<any> = this.onFiltersChangesForLog$.pipe(
		filter(([filters, showOnlyFavorites ]: [FiltersMetadata, boolean]) => Boolean(filters) && filters.size !== 0),
		map(([filters, showOnlyFavorites]: [FiltersMetadata, boolean]) => {
			const filtersData = filtersToString(filters);
			const filtersState = `Filters changed:\nshowOnlyFavorites: ${ showOnlyFavorites } ${ Boolean(filters) ? filtersData : '' }`;
			return filtersState;
		}),
		distinctUntilChanged(isEqual),
		map((message: string) => new LogFilters(message))
	);

	@Effect()
	updateOverlayFilters$ = this.filtersMetadata$.pipe(
		withLatestFrom(this.overlaysArray$),
		mergeMap(([filtersMetadata, overlaysArray]: [FiltersMetadata, IOverlay[]]) => {
			const filterModels: IFilterModel[] = FiltersService.pluckFilterModels(filtersMetadata);
			const filteredOverlays: string[] = buildFilteredOverlays(overlaysArray, filterModels);
			const actions: Action[] = [
				new SetFilteredOverlaysAction(filteredOverlays)
			];
			// If there are overlays, before applying the filters, set the status message according to the filters
			if (overlaysArray && overlaysArray.length) {
				const message = (filteredOverlays && filteredOverlays.length) ? overlaysStatusMessages.nullify : this.translate.instant(overlaysStatusMessages.noOverLayMatchFilters);
				actions.push(new SetOverlaysStatusMessageAction({ message }));
			}
			return actions;
		}));

	@Effect()
	updateOverlayDrops$ = this.forOverlayDrops$.pipe(
		withLatestFrom(this.store$.select(selectDrops)),
		filter(([[overlaysMap, filteredOverlays, specialObjects, favoriteOverlays, showOnlyFavorites], oldDrops]: [[Map<string, IOverlay>, string[], Map<string, IOverlaySpecialObject>, IOverlay[], boolean], IOverlayDrop[]]) => Boolean(overlaysMap.size)),
		mergeMap(([[overlaysMap, filteredOverlays, specialObjects, favoriteOverlays, showOnlyFavorites], oldDrops]: [[Map<string, IOverlay>, string[], Map<string, IOverlaySpecialObject>, IOverlay[], boolean], IOverlayDrop[]]) => {
			let drops = OverlaysService.parseOverlayDataForDisplay({
				overlaysArray: mapValuesToArray(overlaysMap),
				filteredOverlays,
				specialObjects,
				favoriteOverlays,
				showOnlyFavorites
			}).concat(oldDrops);

			drops = this.removeDuplicateDrops(drops);
			return [new SetDropsAction(drops), new SetTotalOverlaysAction({ number: drops.length })];
		})
	);

	@Effect()
	initializeFilters$: Observable<any> = this.actions$.pipe(
		ofType<LoadOverlaysAction>(OverlaysActionTypes.LOAD_OVERLAYS),
		map(() => new InitializeFiltersAction()));

	@Effect()
	onInitializeFilters$: Observable<InitializeFiltersSuccessAction> = combineLatest(
		[this.store$.select(selectOverlaysAreLoaded), this.store$.select(selectOverlaysContainmentChecked)]).pipe(
		withLatestFrom(this.overlaysArray$, this.facets$),
		filter(([[overlaysAreLoaded, overlaysContainmentChecked], overlays, facets]: [[boolean, boolean], IOverlay[], ICaseFacetsState]) => overlaysAreLoaded && overlaysContainmentChecked),
		map(([[overlaysAreLoaded, overlaysContainmentChecked], overlays, facets]: [[boolean, boolean], IOverlay[], ICaseFacetsState]) => {
			const filtersMetadata = new Map<IFilter, FilterMetadata>(
				this.config.filters.map<[IFilter, FilterMetadata]>((filterKey: IFilter) => {
					const metadata: FilterMetadata = this.resolveMetadata(filterKey.type);
					const selectedFilter = facets.filters.find(({ fieldName }) => fieldName === filterKey.modelName);
					metadata.initializeFilter(overlays, filterKey.modelName, selectedFilter, filterKey.visibility);
					return [filterKey, metadata];
				})
			);
			const filtersCounters = new Map<IFilter, FilterCounters>(
				this.config.filters.map<[IFilter, FilterCounters]>((filterKey: IFilter) => {
					const counters: FilterCounters = this.resolveCounters(filterKey.type);
					counters.initFromMetadata(filtersMetadata.get(filterKey));
					return [filterKey, counters];
				})
			);
			return new InitializeFiltersSuccessAction({ filtersMetadata, filtersCounters });
		}),
		catchError(err => {
			console.error(err);
			return of(new InitializeFiltersSuccessAction({
				filtersMetadata: new Map<IFilter, FilterMetadata>([]),
				filtersCounters: new Map<IFilter, FilterCounters>([])
			}));
		})
	);

	@Effect()
	updateFiltersBadge$: Observable<any> = this.onFiltersChanges$.pipe(
		map(([filters, showOnlyFavorites]: [FiltersMetadata, boolean, IOverlay[]]) => {
			let badge = '0';

			if (showOnlyFavorites) {
				badge = '★';
			} else {
				const filterValues = mapValuesToArray(filters);
				badge = filterValues.reduce((badgeNum: number, filterMetadata: FilterMetadata) => filterMetadata.isFiltered() ? badgeNum + 1 : badgeNum, 0).toString();
			}

			return new SetBadgeAction({ key: 'Filters', badge: badge === '0' ? undefined : badge });
		}),
		share()
	);

	@Effect()
	setShowFavoritesFlagOnFilters$: Observable<any> = this.favoriteOverlays$.pipe(
		map((favoriteOverlays: IOverlay[]) => new EnableOnlyFavoritesSelectionAction(Boolean(favoriteOverlays.length)))
	);

	@Effect()
	filteredOverlaysChanged$: Observable<any> = this.store$.select(selectFilteredOveralys).pipe(
		withLatestFrom(this.store$.select(filtersStateSelector), this.store$.select(selectOverlaysMap), this.store$.select(selectFavoriteOverlays)),
		filter(([filteredOverlays, filterState, overlays]: [string[], IFiltersState, Map<string, IOverlay>, IOverlay[]]) => Boolean(overlays.size)),
		map(([filteredOverlays, filterState, overlays, favoriteOverlays]: [string[], IFiltersState, Map<string, IOverlay>, IOverlay[]]) => {
			const filtersCounters = filterState.filtersCounters;
			const filtersChanges = Array.from(filterState.filtersMetadata).map(([metadataKey, metadata]: [IFilter, FilterMetadata]) => {
				const cloneCounters = cloneDeep(filtersCounters.get(metadataKey));

				cloneCounters.resetFilteredCount();
				filteredOverlays.forEach((id: string) => {
					const overlay = overlays.get(id);
					cloneCounters.incrementFilteredCount(_get(overlay, metadataKey.modelName));
				});
				if (metadata instanceof EnumFilterMetadata || metadata instanceof BooleanFilterMetadata) {
					FiltersService.calculatePotentialOverlaysCount(metadataKey, metadata, cloneCounters, overlays, favoriteOverlays, filterState);
				}
				return { filter: metadataKey, newCounters: cloneCounters };
			});
			return new UpdateFiltersCounters(filtersChanges);
		}));


	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected genericTypeResolverService: GenericTypeResolverService,
				public translate: TranslateService,
				@Inject(filtersConfig) protected config: IFiltersConfig) {
	}

	removeDuplicateDrops(drops: IOverlayDrop[]): IOverlayDrop[] {
		return drops.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
	}

	resolveMetadata(filterType: FilterType): FilterMetadata {
		const resolveFilterFunction: InjectionResolverFilter = (function wrapperFunction() {
			return function resolverFilteringFunction(filterMetadata: FilterMetadata[]): FilterMetadata {
				return filterMetadata.find((item) => item.type === FilterType[filterType]);
			};
		})();
		return this.genericTypeResolverService.resolveMultiInjection(FilterMetadata, resolveFilterFunction, false);
	}

	resolveCounters(filterType: FilterType): FilterCounters {
		const resolveFilterFunction: InjectionResolverFilter = (function wrapperFunction() {
			return function resolverFilteringFunction(filterCounters: FilterCounters[]): FilterCounters {
				return filterCounters.find((item) => item.type === FilterType[filterType]);
			};
		})();
		return this.genericTypeResolverService.resolveMultiInjection(FilterCounters, resolveFilterFunction, false);
	}
}
