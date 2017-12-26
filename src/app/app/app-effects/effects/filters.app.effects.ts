import { cloneDeep, isNil } from 'lodash';
import { Case, UpdateCaseAction } from '@ansyn/menu-items/cases';
import { Overlay, OverlaysActionTypes } from '@ansyn/overlays';
import { Observable } from 'rxjs/Observable';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { IAppState } from '../app.effects.module';
import { Filter, FilterMetadata, InitializeFiltersAction, ResetFiltersAction } from '@ansyn/menu-items/filters';
import { filtersStateSelector, IFiltersState } from '@ansyn/menu-items/filters/reducer/filters.reducer';
import {
	LoadOverlaysAction,
	LoadOverlaysSuccessAction,
	SetFilteredOverlaysAction
} from '@ansyn/overlays/actions/overlays.actions';
import { IOverlaysState, overlaysStateSelector } from '@ansyn/overlays/reducers/overlays.reducer';
import { EnableOnlyFavoritesSelectionAction } from '@ansyn/menu-items/filters/actions/filters.actions';
import 'rxjs/add/operator/share';
import 'rxjs/add/observable/of';
import { facetChangesActionType } from '@ansyn/menu-items/filters/effects/filters.effects';
import { casesStateSelector } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { EnumFilterMetadata } from '@ansyn/menu-items/filters/models/metadata/enum-filter-metadata';
import { SliderFilterMetadata } from '@ansyn/menu-items/filters/models/metadata/slider-filter-metadata';
import { SetBadgeAction } from '@ansyn/menu/actions/menu.actions';
import { CoreActionTypes, SetFavoriteOverlaysAction } from '@ansyn/core/actions/core.actions';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { coreStateSelector, ICoreState } from '@ansyn/core/reducers/core.reducer';

@Injectable()
export class FiltersAppEffects {

	/**
	 * @type Effect
	 * @name updateOverlayFilters$
	 * @ofType InitializeFiltersSuccessAction, UpdateFilterAction, ToggleOnlyFavoriteAction, SyncFilteredOverlays
	 * @action SetFilteredOverlaysAction
	 * @dependencies filters, cases
	 */
	@Effect()
	updateOverlayFilters$: Observable<SetFilteredOverlaysAction> = this.actions$
		.ofType(...facetChangesActionType, CoreActionTypes.SET_FAVORITE_OVERLAYS)
		.withLatestFrom(this.store$.select(filtersStateSelector), this.store$.select(coreStateSelector), this.store$.select(overlaysStateSelector))
		.map(([action, filters, core, overlays]: [Action, IFiltersState, ICoreState, IOverlaysState]) => {
			const filteredOverlays = this.buildFilteredOverlays(overlays.overlays, filters, core.favoriteOverlays);
			return new SetFilteredOverlaysAction(filteredOverlays);
		});

	/**
	 * @type Effect
	 * @name updateCaseFacets$
	 * @ofType InitializeFiltersSuccessAction, UpdateFilterAction, ToggleOnlyFavoriteAction, SyncFilteredOverlays
	 * @action UpdateCaseAction
	 * @dependencies filters, cases
	 */
	@Effect()
	updateCaseFacets$: Observable<UpdateCaseAction> = this.actions$
		.ofType(...facetChangesActionType)
		.withLatestFrom(this.store$.select(filtersStateSelector), this.store$.select(casesStateSelector).pluck('selectedCase'))
		.map(([action, filtersState, selectedCase]: [Action, IFiltersState, Case]) => this.updateCaseFacets(selectedCase, filtersState))
		.map(updatedCase => new UpdateCaseAction(updatedCase));

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
		.withLatestFrom(this.store$.select(casesStateSelector).pluck('selectedCase'), this.store$.select(overlaysStateSelector), (action: any, selectedCase: Case, overlaysState: IOverlaysState): any => {
			const overlaysArray: Overlay[] = Array.from(overlaysState.overlays.values());
			return [overlaysArray, selectedCase.state.facets];
		})
		.map(([overlays, facets]: [Overlay[], any]) => new InitializeFiltersAction({ overlays, facets }));

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
	updateFiltersBadge$: Observable<any> = this.actions$
		.ofType(...facetChangesActionType)
		.withLatestFrom(this.store$.select(filtersStateSelector), (action, filtersState: IFiltersState) => filtersState)
		.map(({ filters, showOnlyFavorites }: IFiltersState) => {
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
	setShowFavoritesFlagOnFilters$: Observable<any> = this.actions$
		.ofType<SetFavoriteOverlaysAction>(CoreActionTypes.SET_FAVORITE_OVERLAYS)
		.map(({ payload }: SetFavoriteOverlaysAction) => {
			return new EnableOnlyFavoritesSelectionAction(payload && !!payload.length);
		});

	constructor(protected actions$: Actions, protected store$: Store<IAppState>) {
	}

	updateCaseFacets(selectedCase: Case, filtersState: IFiltersState): Case {
		const cloneSelectedCase: Case = cloneDeep(selectedCase);
		const { facets } = cloneSelectedCase.state;
		facets.showOnlyFavorites = filtersState.showOnlyFavorites;
		facets.filters = [];
		filtersState.filters.forEach((newMetadata: FilterMetadata, filter: Filter) => {
			const currentFilter: any = facets.filters.find(({ fieldName }) => fieldName === filter.modelName);
			const outerStateMetadata: any = newMetadata.getMetadataForOuterState();

			if (!currentFilter && !this.isMetadataEmpty(outerStateMetadata)) {
				const [fieldName, metadata] = [filter.modelName, outerStateMetadata];
				facets.filters.push({ fieldName, metadata });
			}
			else if (currentFilter && !this.isMetadataEmpty(outerStateMetadata)) {
				currentFilter.metadata = outerStateMetadata;
			}
			else if (currentFilter && this.isMetadataEmpty(outerStateMetadata)) {
				const index = facets.filters.indexOf(currentFilter);
				facets.filters.splice(index, 1);
			}
		});

		return cloneSelectedCase;
	}

	isMetadataEmpty(metadata: any): boolean {
		return isNil(metadata);
	}

	buildFilteredOverlays(overlays: Map<string, Overlay>, filters: IFiltersState, favoriteOverlays: string[]) {
		const parsedFilters = Array.from(filters.filters)
			.map(([key, value]) => ({
				filteringParams: {
					key: key.modelName,
					metadata: value
				},
				filterFunc: value.filterFunc
			}));
		const favorites = favoriteOverlays;
		const { showOnlyFavorites } = filters;
		let overlaysToFilter = showOnlyFavorites ? new Map<string, Overlay>(<any>favorites.map((id) => [id, overlays.get(id)])) : overlays;
		return OverlaysService.filter(overlaysToFilter, parsedFilters);
	}
}
