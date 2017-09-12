import { cloneDeep, isNil, isEmpty } from 'lodash';

import { Case, UpdateCaseAction, ICasesState } from '@ansyn/menu-items/cases';
import { OverlaysActionTypes, Overlay } from '@ansyn/overlays';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { IAppState } from '../app-reducers.module';
import {
	InitializeFiltersAction,
	ResetFiltersAction,
	FilterMetadata,
	FiltersService,
	Filter,
	FiltersActionTypes
} from '@ansyn/menu-items/filters';
import { IFiltersState } from '@ansyn/menu-items/filters/reducer/filters.reducer';
import { SetFiltersAction } from '@ansyn/overlays/actions/overlays.actions';
import { IOverlayState } from '@ansyn/overlays/reducers/overlays.reducer';
import { InitializeFiltersSuccessAction, UpdateFilterAction } from '@ansyn/menu-items/filters/actions/filters.actions';
import 'rxjs/add/operator/share';
import 'rxjs/add/observable/of';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';

@Injectable()
export class FiltersAppEffects {
	facetChangesActionType = [FiltersActionTypes.INITIALIZE_FILTERS_SUCCESS, FiltersActionTypes.UPDATE_FILTER_METADATA, FiltersActionTypes.RESET_FILTERS, FiltersActionTypes.TOGGLE_ONLY_FAVORITES, OverlaysActionTypes.SYNC_FILTERED_OVERLAYS];

	@Effect()
	updateOverlayFilters$: Observable<SetFiltersAction> = this.actions$
		.ofType(...this.facetChangesActionType)
		.withLatestFrom(this.store$.select('filters'), this.store$.select('cases'))
		.map(([action, filtersState, casesState]: [InitializeFiltersSuccessAction | UpdateFilterAction | ResetFiltersAction, IFiltersState, ICasesState]) => {
			const parsedFilters = [];
			const favorites = casesState.selected_case.state.favoritesOverlays;
			filtersState.filters.forEach((value: any, key: any) => {
				parsedFilters.push({
					filteringParams: { key: key.modelName, metadata: value },
					filterFunc: value.filterFunc
				});
			});
			return new SetFiltersAction({
				parsedFilters,
				showOnlyFavorites: filtersState.showOnlyFavorites,
				favorites
			});
		});

	@Effect()
	updateCaseFacets$: Observable<UpdateCaseAction> = this.actions$
		.ofType(...this.facetChangesActionType)
		.withLatestFrom(this.store$.select('filters'), this.store$.select('cases').pluck('selected_case'))
		.map(([action, filtersState, selectedCase]: [any, any, any]) => {
			return this.updateCaseFacets(selectedCase, filtersState);
		})
		.map(updatedCase => new UpdateCaseAction(updatedCase));

	@Effect()
	initializeFilters$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS)
		.withLatestFrom(this.store$.select('cases'), this.store$.select('overlays'), (action: any, casesState: ICasesState, overlaysState: IOverlayState): any => {
			const overlaysArray: Overlay[] = [];
			overlaysState.overlays.forEach((value, key) => {
				overlaysArray.push(value);
			});
			const showAll: boolean = casesState.selected_case.id === casesState.default_case.id && this.casesService.contextValues.imageryCount === -1;
			if (this.casesService.contextValues.imageryCount !== -1) {
				this.casesService.contextValues.imageryCount = -1;
			}
			return [overlaysArray, casesState.selected_case.state.facets, showAll];
		})
		.map(([overlays, facets, showAll]: [Overlay[], any, boolean]) => {

			return new InitializeFiltersAction({ overlays, facets, showAll });
		});

	@Effect()
	resetFilters$: Observable<ResetFiltersAction> = this.actions$
		.ofType(OverlaysActionTypes.LOAD_OVERLAYS)
		.map(() => new ResetFiltersAction());

	constructor(private actions$: Actions,
				private store$: Store<IAppState>, private casesService: CasesService, private filtersService: FiltersService) {
	}

	updateCaseFacets(selected_case: Case, filtersState: IFiltersState): Case {
		const cloneSelectedCase: Case = cloneDeep(selected_case);
		const { facets } = cloneSelectedCase.state;
		facets.showOnlyFavorites = filtersState.showOnlyFavorites;

		filtersState.filters.forEach((newMetadata: FilterMetadata, filter: Filter) => {
			const currentFilter: any = facets.filters.find(({ fieldName }) => fieldName === filter.modelName);
			const outerStateMetadata: any = newMetadata.getMetadataForOuterState();
			if (!currentFilter && !this.isMetadataEmpty(outerStateMetadata)) {
				const [fieldName, metadata] = [filter.modelName, outerStateMetadata];
				facets.filters.push({ fieldName, metadata });
			} else if (currentFilter && !this.isMetadataEmpty(outerStateMetadata)) {
				currentFilter.metadata = outerStateMetadata;
			} else if (currentFilter && this.isMetadataEmpty(outerStateMetadata)) {
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
