import { cloneDeep, isNil, isEmpty } from 'lodash';

import { Case, UpdateCaseAction, CasesActionTypes, ICasesState } from '@ansyn/menu-items/cases';
import { OverlaysActionTypes, Overlay } from '@ansyn/overlays';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
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

@Injectable()
export class FiltersAppEffects {

	@Effect()
	updateOverlayFilters$ : Observable<SetFiltersAction> = this.actions$
		.ofType(FiltersActionTypes.INITIALIZE_FILTERS_SUCCESS, FiltersActionTypes.UPDATE_FILTER_METADATA, FiltersActionTypes.RESET_FILTERS)
		.withLatestFrom(this.store$.select('filters'))
		.map(([action, filtersState]: [any, IFiltersState]) => {
			const parsedFilters = [];
			filtersState.filters.forEach((value: any, key: any) => {
				parsedFilters.push({
					filteringParams: { key: key.modelName, metadata: value},
					filterFunc: value.filterFunc
				})
			});
			return new SetFiltersAction(parsedFilters)
		}).share();


    @Effect()
    initializeFilters$: Observable<any> = this.actions$
        .ofType(OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS)
        .withLatestFrom(this.store$.select('cases'), this.store$.select('overlays'), (action: any, casesState: ICasesState, overlaysState: IOverlayState): any => {
			const overlaysArray: Overlay[] = [];
        	overlaysState.overlays.forEach((value, key) => {
				overlaysArray.push(value);
			});
            return [overlaysArray, casesState.selected_case.state.facets];
        })
        .map(([overlays, facets]: [Overlay[], any]) => {
            return new InitializeFiltersAction({ overlays: overlays, facets: facets });
        }).share();

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
        private store$: Store<IAppState>,
        private filtersService: FiltersService) { }

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
