import { Observable } from 'rxjs/Observable';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { IAppState } from '../app.effects.module';
import {
	Filters,
	selectFilters,
	selectOldFilters,
	selectShowOnlyFavorite
} from '@ansyn/menu-items/filters/reducer/filters.reducer';
import {
	LoadOverlaysAction,
	LoadOverlaysSuccessAction,
	OverlaysActionTypes,
	SetFilteredOverlaysAction,
	SetOverlaysStatusMessage
} from '@ansyn/overlays/actions/overlays.actions';
import { overlaysStatusMessages, selectOverlaysArray } from '@ansyn/overlays/reducers/overlays.reducer';
import {
	EnableOnlyFavoritesSelectionAction,
	FiltersActionTypes,
	InitializeFiltersAction,
	InitializeFiltersSuccessAction,
	ResetFiltersAction
} from '@ansyn/menu-items/filters/actions/filters.actions';
import 'rxjs/add/operator/share';
import 'rxjs/add/observable/of';
import { casesStateSelector, ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { EnumFilterMetadata } from '@ansyn/menu-items/filters/models/metadata/enum-filter-metadata';
import { SliderFilterMetadata } from '@ansyn/menu-items/filters/models/metadata/slider-filter-metadata';
import { SetBadgeAction } from '@ansyn/menu/actions/menu.actions';
import { selectFavoriteOverlays } from '@ansyn/core/reducers/core.reducer';
import { BooleanFilterMetadata } from '@ansyn/menu-items/filters/models/metadata/boolean-filter-metadata';
import { CaseFacetsState, CaseFilter, FilterType } from '@ansyn/core/models/case.model';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { FilterMetadata } from '@ansyn/menu-items/filters/models/metadata/filter-metadata.interface';
import { FiltersService } from '@ansyn/menu-items/filters/services/filters.service';
import { FilterModel } from '@ansyn/core/models/filter.model';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { Filter } from '@ansyn/menu-items/filters/models/filter';
import { InjectionResolverFilter } from '@ansyn/core/services/generic-type-resolver';
import { GenericTypeResolverService } from '@ansyn/core/services/generic-type-resolver.service';

@Injectable()
export class FiltersAppEffects {

	filters$: Observable<Filters> = this.store$.select(selectFilters);
	showOnlyFavorite$ = this.store$.select(selectShowOnlyFavorite);
	favoriteOverlays$ = this.store$.select(selectFavoriteOverlays);
	overlaysArray$ = this.store$.select(selectOverlaysArray);
	onFiltersChanges$: Observable<[Filters, boolean]> = Observable.combineLatest(this.filters$, this.showOnlyFavorite$);
	facets$ = this.store$.select(casesStateSelector)
		.filter(cases => Boolean(cases.selectedCase))
		.map((cases: ICasesState) => cases.selectedCase.state.facets);
	oldFilters$ = this.store$.select(selectOldFilters);

	/**
	 * @type Effect
	 * @name updateOverlayFilters$
	 * @ofType onFiltersChanges$
	 * @action SyncOverlaysWithFavoritesAfterLoadedAction, SetFilteredOverlaysAction
	 * @filter overlays are loaded
	 * @dependencies filters, core, overlays
	 */
	@Effect()
	updateOverlayFilters$ = this.onFiltersChanges$
		.withLatestFrom(this.favoriteOverlays$, this.overlaysArray$)
		.mergeMap(([[filters, showOnlyFavorite], favoriteOverlays, overlaysArray]: [[Filters, boolean], Overlay[], Overlay[]]) => {
			const filterModels: FilterModel[] = FiltersService.pluckFilterModels(filters);
			const filteredOverlays: string[] = OverlaysService.buildFilteredOverlays(overlaysArray, filterModels, favoriteOverlays, showOnlyFavorite);
			const message = (filteredOverlays && filteredOverlays.length) ? overlaysStatusMessages.nullify : overlaysStatusMessages.noOverLayMatchFilters;
			return [
				new SetFilteredOverlaysAction(filteredOverlays),
				new SetOverlaysStatusMessage(message)
			];
		});

	/**
	 * @type Effect
	 * @name initializeFilters$
	 * @ofType LoadOverlaysSuccessAction
	 * @dependencies cases, overlays
	 * @action InitializeFiltersAction
	 */
	@Effect()
	initializeFilters$: Observable<any> = this.actions$
		.ofType<LoadOverlaysSuccessAction>(OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS)
		.map(() => new InitializeFiltersAction());

	@Effect()
	onInitializeFilters$: Observable<InitializeFiltersSuccessAction> = this.actions$
		.ofType<InitializeFiltersAction>(FiltersActionTypes.INITIALIZE_FILTERS)
		.withLatestFrom(this.oldFilters$, this.overlaysArray$, this.facets$)
		.map(([action, oldFilters, overlays, facets]: [Action, Filters, Overlay[], CaseFacetsState]) => {
			const filtersConfig: Filter[] = this.filtersService.getFilters();
			const filters: Map<Filter, FilterMetadata> = new Map<Filter, FilterMetadata>();
			const oldFiltersArray = oldFilters ? Array.from(oldFilters) : [];

			filtersConfig.forEach((filter: Filter) => {
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

	/**
	 * @type Effect
	 * @name resetFilters$
	 * @ofType LoadOverlaysAction
	 * @action ResetFiltersAction
	 */
	@Effect()
	resetFilters$: Observable<ResetFiltersAction> = this.actions$
		.ofType<LoadOverlaysAction>(OverlaysActionTypes.LOAD_OVERLAYS)
		.map(() => new ResetFiltersAction());


	/**
	 * @type Effect
	 * @name updateFiltersBadge$
	 * @ofType InitializeFiltersSuccessAction, UpdateFilterAction, ToggleOnlyFavoriteAction
	 * @dependencies filters
	 * @action SetBadgeAction
	 */
	@Effect()
	updateFiltersBadge$: Observable<any> = this.onFiltersChanges$
		.map(([filters, showOnlyFavorites]: [Filters, boolean]) => {
			let badge = '0';

			if (showOnlyFavorites) {
				badge = '★';
			} else {
				const enumFilterValues = Array.from(filters.values());

				badge = enumFilterValues.reduce((badgeNum: number, filterMetadata: FilterMetadata) => {
					switch (filterMetadata.constructor) {
						case EnumFilterMetadata:
							const someUnchecked = Array.from((<EnumFilterMetadata>filterMetadata).enumsFields.values()).some(({ isChecked }) => !isChecked);
							return someUnchecked ? badgeNum + 1 : badgeNum;
						case SliderFilterMetadata:
							const someNotInfinity = (<SliderFilterMetadata>filterMetadata).start !== -Infinity || (<SliderFilterMetadata>filterMetadata).end !== Infinity;
							return someNotInfinity ? badgeNum + 1 : badgeNum;
						case BooleanFilterMetadata: {
							const someUnchecked = !(<BooleanFilterMetadata>filterMetadata).trueProperties.value || !(<BooleanFilterMetadata>filterMetadata).falseProperties.value;
							return someUnchecked ? badgeNum + 1 : badgeNum;
						}
						default:
							return badgeNum;
					}
				}, 0).toString();
			}

			return new SetBadgeAction({ key: 'Filters', badge });
		})
		.share();

	/**
	 * @type Effect
	 * @name setShowFavoritesFlagOnFilters$
	 * @ofType SetFavoriteOverlaysAction
	 * @action EnableOnlyFavoritesSelectionAction
	 */
	@Effect()
	setShowFavoritesFlagOnFilters$: Observable<any> = this.favoriteOverlays$
		.map((favoriteOverlays: Overlay[]) => new EnableOnlyFavoritesSelectionAction(Boolean(favoriteOverlays.length)));

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected genericTypeResolverService: GenericTypeResolverService,
				protected filtersService: FiltersService) {
	}

	initializeMetadata(filter: Filter, facets: CaseFacetsState): FilterMetadata {
		const filterType = filter.type;

		const resolveFilterFunction: InjectionResolverFilter = (function wrapperFunction() {
			return function resolverFilteringFunction(filterMetadata: FilterMetadata[]): FilterMetadata {
				return filterMetadata.find((item) => item.type === FilterType[filterType]);
			};
		})();

		const metaData: FilterMetadata =
			this.genericTypeResolverService.resolveMultiInjection(FilterMetadata, resolveFilterFunction, false);

		const currentFilterInit = <CaseFilter> (facets.filters && facets.filters.find(({ fieldName }) => fieldName === filter.modelName));

		metaData.initializeFilter(currentFilterInit && currentFilterInit.metadata, filter);
		return metaData;
	}
}
