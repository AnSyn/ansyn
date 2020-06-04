import { combineLatest, Observable, of } from 'rxjs';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Inject, Injectable } from '@angular/core';
import {
	selectFavoriteOverlays,
	selectRemovedOverlays,
	selectRemovedOverlaysVisibility
} from '../../modules/overlays/overlay-status/reducers/overlay-status.reducer';
import { IAppState } from '../app.effects.module';
import { SetBadgeAction, SetHideResultsTableBadgeAction } from '@ansyn/menu';
import { catchError, distinctUntilChanged, filter, map, mergeMap, share, tap, withLatestFrom } from 'rxjs/operators';
import { BooleanFilterMetadata } from '../../modules/filters/models/metadata/boolean-filter-metadata';
import {
	EnableOnlyFavoritesSelectionAction,
	InitializeFiltersAction,
	InitializeFiltersSuccessAction, UpdateFilterCounters
} from '../../modules/filters/actions/filters.actions';
import { EnumFilterMetadata } from '../../modules/filters/models/metadata/enum-filter-metadata';
import { FilterMetadata } from '../../modules/filters/models/metadata/filter-metadata.interface';
import {
	filtersToString,
	FiltersMetadata,
	filtersStateSelector,
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
	SetOverlaysStatusMessageAction, SetTotalOverlaysAction
} from '../../modules/overlays/actions/overlays.actions';
import {
	overlaysStatusMessages,
	selectFilteredOveralys,
	selectOverlaysArray,
	selectOverlaysMap,
	selectSpecialObjects
} from '../../modules/overlays/reducers/overlays.reducer';
import { OverlaysService } from '../../modules/overlays/services/overlays.service';
import { FilterType } from '../../modules/filters/models/filter-type';
import { ICaseFacetsState } from '../../modules/menu-items/cases/models/case.model';
import { IOverlay, IOverlaySpecialObject } from '../../modules/overlays/models/overlay.model';
import { cloneDeep, get as _get, isEqual } from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '../../modules/core/services/logger.service';
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
	removedOverlays$: Observable<any> = this.store$.select(selectRemovedOverlays);
	removedOverlaysVisibility$: Observable<any> = this.store$.select(selectRemovedOverlaysVisibility);
	onFiltersChanges$: Observable<[FiltersMetadata, boolean, IOverlay[], string[], boolean]> = combineLatest(this.filtersMetadata$, this.showOnlyFavorite$, this.favoriteOverlays$, this.removedOverlays$, this.removedOverlaysVisibility$);
	onCriterialFiltersChanges$: Observable<[FiltersMetadata, string[], boolean]> = combineLatest(this.filtersMetadata$, this.removedOverlays$, this.removedOverlaysVisibility$);
	forOverlayDrops$: Observable<[Map<string, IOverlay>, string[], Map<string, IOverlaySpecialObject>, IOverlay[], boolean]> = combineLatest(
		this.overlaysMap$, this.filteredOverlays$, this.specialObjects$, this.favoriteOverlays$, this.showOnlyFavorite$);
	facets$: Observable<ICaseFacetsState> = this.store$.select(selectFacets);
	onFiltersChangesForLog$: Observable<[FiltersMetadata, boolean, string[], boolean]> = combineLatest(this.filtersMetadata$, this.showOnlyFavorite$, this.removedOverlays$, this.removedOverlaysVisibility$);

	@Effect({ dispatch: false })
	filtersLogger$: Observable<any> = this.onFiltersChangesForLog$.pipe(
		filter(([filters, showOnlyFavorites, removedOverlays, removedOverlaysVisibality]: [FiltersMetadata, boolean, string[], boolean]) => Boolean(filters) && filters.size !== 0),
		map(([filters, showOnlyFavorites, removedOverlays, removedOverlaysVisibality]: [FiltersMetadata, boolean, string[], boolean]) => {
			const filtersData = filtersToString(filters);
			const filtersState = `{"showOnlyFavorites": "${showOnlyFavorites}", "removedOverlays": "${JSON.stringify(removedOverlays)}", "removedOverlaysVisibality": "${removedOverlaysVisibality}", "filters": ${Boolean(filters) ? filtersData : filters}}`;
			return filtersState;
		}),
		distinctUntilChanged(isEqual),
		tap((message: string) => {
			this.loggerService.info(message, 'Filters', 'Filtered Data Changed');
		})
	);

	@Effect()
	updateOverlayFilters$ = this.onCriterialFiltersChanges$.pipe(
		withLatestFrom(this.overlaysArray$),
		mergeMap(([[filtersMetadata, removedOverlaysIds, removedOverlaysVisibility], overlaysArray]: [[FiltersMetadata, string[], boolean], IOverlay[]]) => {
			const filterModels: IFilterModel[] = FiltersService.pluckFilterModels(filtersMetadata);
			const filteredOverlays: string[] = buildFilteredOverlays(overlaysArray, filterModels, removedOverlaysIds, removedOverlaysVisibility);
			const message = (filteredOverlays && filteredOverlays.length) ? overlaysStatusMessages.nullify : this.translate.instant(overlaysStatusMessages.noOverLayMatchFilters);
			return [
				new SetFilteredOverlaysAction(filteredOverlays),
				new SetOverlaysStatusMessageAction(message),
				new SetHideResultsTableBadgeAction(false)
			];
		}));

	@Effect()
	updateOverlayDrops$ = this.forOverlayDrops$.pipe(
		mergeMap(([overlaysMap, filteredOverlays, specialObjects, favoriteOverlays, showOnlyFavorites]: [Map<string, IOverlay>, string[], Map<string, IOverlaySpecialObject>, IOverlay[], boolean]) => {
			const drops = OverlaysService.parseOverlayDataForDisplay({
				overlaysArray: mapValuesToArray(overlaysMap),
				filteredOverlays,
				specialObjects,
				favoriteOverlays,
				showOnlyFavorites
			});

			return [new SetDropsAction(drops), new SetTotalOverlaysAction(drops.length)];
		})
	);

	@Effect()
	initializeFilters$: Observable<any> = this.actions$.pipe(
		ofType<LoadOverlaysAction>(OverlaysActionTypes.LOAD_OVERLAYS),
		map(() => new InitializeFiltersAction()));

	@Effect()
	onInitializeFilters$: Observable<InitializeFiltersSuccessAction> = this.actions$.pipe(
		ofType<InitializeFiltersAction>(OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS),
		withLatestFrom(this.overlaysArray$, this.facets$),
		map(([action, overlays, facets]: [Action, IOverlay[], ICaseFacetsState]) => {
			const filtersMetadata = new Map<IFilter, FilterMetadata>(
				this.config.filters.map<[IFilter, FilterMetadata]>((filterKey: IFilter) => {
					const metadata: FilterMetadata = this.resolveMetadata(filterKey.type)
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
		map(([filters, showOnlyFavorites]: [FiltersMetadata, boolean, IOverlay[], string[], boolean]) => {
			let badge = '0';

			if (showOnlyFavorites) {
				badge = '★';
			} else {
				const filterValues = mapValuesToArray(filters);
				badge = filterValues.reduce((badgeNum: number, filterMetadata: FilterMetadata) => filterMetadata.isFiltered() ? badgeNum + 1 : badgeNum, 0).toString();
			}

			return new SetBadgeAction({ key: 'Filters', badge });
		}),
		share()
	);

	@Effect()
	setShowFavoritesFlagOnFilters$: Observable<any> = this.favoriteOverlays$.pipe(
		map((favoriteOverlays: IOverlay[]) => new EnableOnlyFavoritesSelectionAction(Boolean(favoriteOverlays.length)))
	);

	@Effect()
	filteredOverlaysChanged$: Observable<any> = this.store$.select(selectFilteredOveralys).pipe(
		withLatestFrom(this.store$.select(filtersStateSelector), this.store$.select(selectOverlaysMap), this.store$.select(selectFavoriteOverlays), this.store$.select(selectRemovedOverlays), this.store$.select(selectRemovedOverlaysVisibility)),
		filter(([filteredOverlays, filterState, overlays]: [string[], IFiltersState, Map<string, IOverlay>, IOverlay[], string[], boolean]) => {
			return overlays.size > 0;
		}),
		mergeMap(([filteredOverlays, filterState, overlays, favoriteOverlays, removedOverlaysIds, removedOverlaysVisibility]: [string[], IFiltersState, Map<string, IOverlay>, IOverlay[], string[], boolean]) => {
			const filtersCounters = filterState.filtersCounters;
			return Array.from(filterState.filtersMetadata).map(([metadataKey, metadata]: [IFilter, FilterMetadata]) => {
				const cloneCounters = cloneDeep(filtersCounters.get(metadataKey));

				cloneCounters.resetFilteredCount();
				filteredOverlays.forEach((id: string) => {
					const overlay = overlays.get(id);
					cloneCounters.incrementFilteredCount(_get(overlay, metadataKey.modelName));
				});
				if (metadata instanceof EnumFilterMetadata || metadata instanceof BooleanFilterMetadata) {
					FiltersService.calculatePotentialOverlaysCount(metadataKey, metadata, cloneCounters, overlays, favoriteOverlays, removedOverlaysIds, removedOverlaysVisibility, filterState);
				}
				return new UpdateFilterCounters({ filter: metadataKey, newCounters: cloneCounters });
			});
		}));


	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected genericTypeResolverService: GenericTypeResolverService,
				public translate: TranslateService,
				protected loggerService: LoggerService,
				@Inject(filtersConfig) protected config: IFiltersConfig) {
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
