import { cloneDeep, isEmpty, isNil } from 'lodash';
import { Case, ICasesState, UpdateCaseAction } from '@ansyn/menu-items/cases';
import { Overlay, OverlaysActionTypes } from '@ansyn/overlays';
import { Observable } from 'rxjs/Observable';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { IAppState } from '../app-reducers.module';
import { Filter, FilterMetadata, InitializeFiltersAction, ResetFiltersAction } from '@ansyn/menu-items/filters';
import { IFiltersState } from '@ansyn/menu-items/filters/reducer/filters.reducer';
import { SetFiltersAction } from '@ansyn/overlays/actions/overlays.actions';
import { IOverlayState } from '@ansyn/overlays/reducers/overlays.reducer';
import { InitializeFiltersSuccessAction, UpdateFilterAction } from '@ansyn/menu-items/filters/actions/filters.actions';
import 'rxjs/add/operator/share';
import 'rxjs/add/observable/of';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { facetChangesActionType } from '@ansyn/menu-items/filters/effects/filters.effects';

@Injectable()
export class FiltersAppEffects {

	/**
	 * @type Effect
	 * @name onLoadContexts$
	 * @ofType InitializeFiltersSuccessAction, UpdateFilterAction, ResetFiltersAction, ToggleOnlyFavoriteAction, SyncFilteredOverlays
	 * @action SetFiltersAction
	 * @dependencies filters, cases
	 */
	@Effect()
	updateOverlayFilters$: Observable<SetFiltersAction> = this.actions$
		.ofType(...facetChangesActionType, OverlaysActionTypes.SYNC_FILTERED_OVERLAYS)
		.withLatestFrom(this.store$.select('filters'), this.store$.select('cases'))
		.map(([action, filtersState, casesState]: [InitializeFiltersSuccessAction | UpdateFilterAction | ResetFiltersAction, IFiltersState, ICasesState]) => {
			const parsedFilters = Array.from(filtersState.filters)
				.map(([key, value]) => ({
					filteringParams: {
						key: key.modelName,
						metadata: value
					},
					filterFunc: value.filterFunc
				}));

			const favorites = casesState.selectedCase.state.favoritesOverlays;

			return new SetFiltersAction({
				parsedFilters,
				showOnlyFavorites: filtersState.showOnlyFavorites,
				favorites
			});
		});

	/**
	 * @type Effect
	 * @name updateCaseFacets$
	 * @ofType InitializeFiltersSuccessAction, UpdateFilterAction, ResetFiltersAction, ToggleOnlyFavoriteAction, SyncFilteredOverlays
	 * @action UpdateCaseAction
	 * @dependencies filters, cases
	 */
	@Effect()
	updateCaseFacets$: Observable<UpdateCaseAction> = this.actions$
		.ofType(...facetChangesActionType, OverlaysActionTypes.SYNC_FILTERED_OVERLAYS)
		.withLatestFrom(this.store$.select('filters'), this.store$.select('cases').pluck('selectedCase'))
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
		.ofType(OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS)
		.withLatestFrom(this.store$.select('cases'), this.store$.select('overlays'), (action: any, casesState: ICasesState, overlaysState: IOverlayState): any => {
			const overlaysArray: Overlay[] = Array.from(overlaysState.overlays).map(([key, overlay]: [string, Overlay]) => overlay);

			const showAll = isNil(casesState.selectedCase.state.facets.filters);

			// what is going here  ?? who updates the contextValues imageryCount  and why it is not in the store please add the correct remarks
			if (this.casesService.contextValues.imageryCount !== -1) {
				this.casesService.contextValues.imageryCount = -1;
			}

			return [overlaysArray, casesState.selectedCase.state.facets, showAll];
		})
		.map(([overlays, facets, showAll]: [Overlay[], any, boolean]) => {
			return new InitializeFiltersAction({ overlays, facets, showAll });
		});

	/**
	 * @type Effect
	 * @name resetFilters$
	 * @ofType LoadOverlaysAction
	 * @action ResetFiltersAction
	 */
	@Effect()
	resetFilters$: Observable<ResetFiltersAction> = this.actions$
		.ofType(OverlaysActionTypes.LOAD_OVERLAYS)
		.map(() => new ResetFiltersAction());

	constructor(private actions$: Actions,
				private store$: Store<IAppState>, private casesService: CasesService) {
	}

	updateCaseFacets(selectedCase: Case, filtersState: IFiltersState): Case {
		const cloneSelectedCase: Case = cloneDeep(selectedCase);
		const { facets } = cloneSelectedCase.state;
		facets.showOnlyFavorites = filtersState.showOnlyFavorites;

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
		return isNil(metadata) || ((Array.isArray(metadata)) && isEmpty(metadata));
	}
}
