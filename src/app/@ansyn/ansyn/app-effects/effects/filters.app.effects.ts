import { combineLatest, Observable } from 'rxjs';
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
import { distinctUntilChanged, filter, map, mergeMap, share, tap, withLatestFrom } from 'rxjs/operators';
import { BooleanFilterMetadata } from '../../modules/filters/models/metadata/boolean-filter-metadata';
import {
	EnableOnlyFavoritesSelectionAction,
	InitializeFiltersAction,
	InitializeFiltersSuccessAction, LogFilters
} from '../../modules/filters/actions/filters.actions';
import { EnumFilterMetadata } from '../../modules/filters/models/metadata/enum-filter-metadata';
import { FilterMetadata } from '../../modules/filters/models/metadata/filter-metadata.interface';
import {
	filtersToString,
	Filters,
	filtersStateSelector,
	IFiltersState,
	selectFacets,
	selectFilters,
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
import { get as _get } from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { isEqual } from 'lodash';

@Injectable()
export class FiltersAppEffects {

	filters$: Observable<Filters> = this.store$.select(selectFilters);
	showOnlyFavorite$: Observable<boolean> = this.store$.select(selectShowOnlyFavorites);
	favoriteOverlays$: Observable<IOverlay[]> = this.store$.select(selectFavoriteOverlays);
	overlaysMap$: Observable<Map<string, IOverlay>> = this.store$.select(selectOverlaysMap);
	overlaysArray$: Observable<IOverlay[]> = this.store$.select(selectOverlaysArray);
	filteredOverlays$: Observable<string[]> = this.store$.select(selectFilteredOveralys);
	specialObjects$: Observable<Map<string, IOverlaySpecialObject>> = this.store$.select(selectSpecialObjects);
	removedOverlays$: Observable<any> = this.store$.select(selectRemovedOverlays);
	removedOverlaysVisibility$: Observable<any> = this.store$.select(selectRemovedOverlaysVisibility);
	onFiltersChanges$: Observable<[Filters, boolean, IOverlay[], string[], boolean]> = combineLatest(this.filters$, this.showOnlyFavorite$, this.favoriteOverlays$, this.removedOverlays$, this.removedOverlaysVisibility$);
	onCriterialFiltersChanges$: Observable<[Filters, string[], boolean]> = combineLatest(this.filters$, this.removedOverlays$, this.removedOverlaysVisibility$);
	forOverlayDrops$: Observable<[Map<string, IOverlay>, string[], Map<string, IOverlaySpecialObject>, IOverlay[], boolean]> = combineLatest(
		this.overlaysMap$, this.filteredOverlays$, this.specialObjects$, this.favoriteOverlays$, this.showOnlyFavorite$);
	facets$: Observable<ICaseFacetsState> = this.store$.select(selectFacets);
	onFiltersChangesForLog$: Observable<[Filters, boolean, string[], boolean]> = combineLatest(this.filters$, this.showOnlyFavorite$, this.removedOverlays$, this.removedOverlaysVisibility$);

	@Effect()
	filtersLogger$: Observable<any> = this.onFiltersChangesForLog$.pipe(
		filter(([filters, showOnlyFavorites, removedOverlays, removedOverlaysVisibality]: [Filters, boolean, string[], boolean]) => Boolean(filters) && filters.size !== 0),
		map(([filters, showOnlyFavorites, removedOverlays, removedOverlaysVisibality]: [Filters, boolean, string[], boolean]) => {
			const filtersData = filtersToString(filters);
			const filtersState = `Filters changed:\nshowOnlyFavorites: ${ showOnlyFavorites }, removedOverlays: ${ removedOverlays.length }, removedOverlaysVisibility: ${ removedOverlaysVisibality } ${ Boolean(filters) ? filtersData : '' }`;
			return filtersState;
		}),
		distinctUntilChanged(isEqual),
		map((message: string) => new LogFilters(message))
	);

	@Effect()
	updateOverlayFilters$ = this.onCriterialFiltersChanges$.pipe(
		withLatestFrom(this.overlaysArray$),
		mergeMap(([[filters, removedOverlaysIds, removedOverlaysVisibility], overlaysArray]: [[Filters, string[], boolean], IOverlay[]]) => {
			const filterModels: IFilterModel[] = FiltersService.pluckFilterModels(filters);
			const filteredOverlays: string[] = buildFilteredOverlays(overlaysArray, filterModels, removedOverlaysIds, removedOverlaysVisibility);
			const message = (filteredOverlays && filteredOverlays.length) ? overlaysStatusMessages.nullify : this.translate.instant(overlaysStatusMessages.noOverLayMatchFilters);
			return [
				new SetFilteredOverlaysAction(filteredOverlays),
				new SetOverlaysStatusMessageAction({ message }),
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

			return [new SetDropsAction(drops), new SetTotalOverlaysAction({ number: drops.length })];
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
			const filters = new Map<IFilter, FilterMetadata>(
				this.config.filters.map<[IFilter, FilterMetadata]>((filter: IFilter) => {
					const metadata: FilterMetadata = this.resolveMetadata(filter.type);
					const selectedFilter = facets.filters.find(({ fieldName }) => fieldName === filter.modelName);
					metadata.initializeFilter(overlays, filter.modelName, selectedFilter, filter.visibility);
					return [filter, metadata];
				})
			);
			return new InitializeFiltersSuccessAction(filters);
		}));

	@Effect()
	updateFiltersBadge$: Observable<any> = this.onFiltersChanges$.pipe(
		map(([filters, showOnlyFavorites]: [Filters, boolean, IOverlay[], string[], boolean]) => {
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

	@Effect({ dispatch: false })
	filteredOverlaysChanged$: Observable<any> = this.store$.select(selectFilteredOveralys).pipe(
		withLatestFrom(this.store$.select(filtersStateSelector), this.store$.select(selectOverlaysMap), this.store$.select(selectFavoriteOverlays), this.store$.select(selectRemovedOverlays), this.store$.select(selectRemovedOverlaysVisibility)),
		filter(([filteredOverlays, filterState, overlays]: [string[], IFiltersState, Map<string, IOverlay>, IOverlay[], string[], boolean]) => {
			return overlays.size > 0;
		}),
		tap(([filteredOverlays, filterState, overlays, favoriteOverlays, removedOverlaysIds, removedOverlaysVisibility]: [string[], IFiltersState, Map<string, IOverlay>, IOverlay[], string[], boolean]) => {

			Array.from(filterState.filters).forEach(([metadataKey, metadata]: [IFilter, FilterMetadata]) => {
				metadata.resetFilteredCount();
				filteredOverlays.forEach((id: string) => {
					const overlay = overlays.get(id);
					metadata.incrementFilteredCount(_get(overlay, metadataKey.modelName));
				});
				if (metadata instanceof EnumFilterMetadata || metadata instanceof BooleanFilterMetadata) {
					FiltersService.calculatePotentialOverlaysCount(metadataKey, metadata, overlays, favoriteOverlays, removedOverlaysIds, removedOverlaysVisibility, filterState);
				}
			});
		}));


	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected genericTypeResolverService: GenericTypeResolverService,
				public translate: TranslateService,
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
}
