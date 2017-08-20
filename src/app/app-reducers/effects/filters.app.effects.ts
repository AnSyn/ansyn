import { cloneDeep, isNil, isEmpty } from 'lodash';

import { Case, UpdateCaseAction, CasesActionTypes, ICasesState } from '@ansyn/menu-items/cases';
import { OverlaysActionTypes, Overlay } from '@ansyn/overlays';
import { Observable } from 'rxjs/Observable';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { IAppState } from '../app-reducers.module';
import {
    InitializeFiltersAction, ResetFiltersAction, FilterMetadata, FiltersService,
    Filter, FiltersActionTypes
} from '@ansyn/menu-items/filters';
import { IFiltersState } from '@ansyn/menu-items/filters/reducer/filters.reducer';
import { SetFiltersAction } from "@ansyn/overlays/actions/overlays.actions";
import { IOverlayState } from '@ansyn/overlays/reducers/overlays.reducer';
import { InitializeFiltersSuccessAction, UpdateFilterAction } from '@ansyn/menu-items/filters/actions/filters.actions';
import 'rxjs/add/operator/share';
import 'rxjs/add/observable/of';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';

@Injectable()
export class FiltersAppEffects {

	@Effect()
	updateOverlayFilters$: Observable<SetFiltersAction> = this.actions$
		.ofType(FiltersActionTypes.INITIALIZE_FILTERS_SUCCESS, FiltersActionTypes.UPDATE_FILTER_METADATA, FiltersActionTypes.RESET_FILTERS,FiltersActionTypes.TOGGLE_ONLY_FAVORITES,OverlaysActionTypes.SYNC_FILTERED_OVERLAYS)
		.withLatestFrom(this.store$.select('filters'),this.store$.select('cases'))
		.map(([action, filtersState,casesState]: [InitializeFiltersSuccessAction | UpdateFilterAction | ResetFiltersAction, IFiltersState,ICasesState]) => {
			const parsedFilters = [];
			const favorites = casesState.selected_case.state.favoritesOverlays;
			filtersState.filters.forEach((value: any, key: any) => {
				parsedFilters.push({
					filteringParams: { key: key.modelName, metadata: value},
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
	showOnlyFavorites$: Observable<any> = this.actions$
		.ofType(FiltersActionTypes.TOGGLE_ONLY_FAVORITES)
		.withLatestFrom(this.store$.select('filters'),this.store$.select('cases'))
		.map(([action,filters,cases]: [Action,IFiltersState,ICasesState]) => {

			const selectedCase =  cloneDeep(cases.selected_case);

			selectedCase.state.facets.showOnlyFavorites = filters.showOnlyFavorites;

			return new UpdateCaseAction(selectedCase);

	});



    @Effect()
    initializeFilters$: Observable<any> = this.actions$
        .ofType(OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS)
        .withLatestFrom(this.store$.select('cases'), this.store$.select('overlays'), (action: any, casesState: ICasesState, overlaysState: IOverlayState): any => {
			const overlaysArray: Overlay[] = [];
        	overlaysState.overlays.forEach((value, key) => {
				overlaysArray.push(value);
			});
        	const showAll: boolean = casesState.selected_case.id === casesState.default_case.id && this.casesService.contextValues.imageryCount === -1;
        	if (this.casesService.contextValues.imageryCount !== -1){
				this.casesService.contextValues.imageryCount = -1;
			}
			return [overlaysArray, casesState.selected_case.state.facets, showAll];
        })
        .map(([overlays, facets, showAll]: [Overlay[], any, boolean]) => {

            return new InitializeFiltersAction({ overlays, facets, showAll });
        });

    @Effect()
    updateFilters$: Observable<any> = this.actions$
        .ofType(FiltersActionTypes.UPDATE_FILTER_METADATA)
        .map(toPayload)
        .withLatestFrom(this.store$.select('cases'))
        .map(([payload, casesState]: [{ filter: Filter, newMetadata: FilterMetadata }, ICasesState]) => {
            const selected_case: Case = this.updateSelectedCase(payload.filter, payload.newMetadata, casesState);
            return new UpdateCaseAction(selected_case);
        })
        .share();

    @Effect()
    resetFilters$: Observable<any> = this.actions$
        .ofType(OverlaysActionTypes.LOAD_OVERLAYS)
        .map((action) => {
            return new ResetFiltersAction();
        });

    constructor(private actions$: Actions,
        private store$: Store<IAppState>, private casesService: CasesService, private filtersService: FiltersService) { }

    updateSelectedCase(filter: Filter, newMetadata: FilterMetadata, casesState: ICasesState): Case {
        const selected_case: Case = cloneDeep(casesState.selected_case);
        const currentFilter: any = selected_case.state.facets.filters.find((casesFilter: { fieldName: string, metadata: string[] }) => {
            return casesFilter.fieldName === filter.modelName;
        });
        const outerStateMetadata: any = newMetadata.getMetadataForOuterState();

        if (!currentFilter && !this.isMetadataEmpty(outerStateMetadata)) {
            selected_case.state.facets.filters.push({
                fieldName: filter.modelName,
                metadata: outerStateMetadata
            });
        } else if (currentFilter && !this.isMetadataEmpty(outerStateMetadata)) {
            currentFilter.metadata = outerStateMetadata;
        } else if (currentFilter && this.isMetadataEmpty(outerStateMetadata)) {
            const index = selected_case.state.facets.filters.indexOf(currentFilter);
            selected_case.state.facets.filters.splice(index, 1);
        }

        return selected_case;
    }

    isMetadataEmpty(metadata: any): boolean {
        return isNil(metadata) || ((Array.isArray(metadata)) && isEmpty(metadata));
    }
}
