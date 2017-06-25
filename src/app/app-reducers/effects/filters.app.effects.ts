import { cloneDeep, isNil, isEmpty } from 'lodash';
import { Case, UpdateCaseAction, CasesActionTypes, ICasesState } from '@ansyn/menu-items/cases';
import { SetFilter } from '@ansyn/overlays';
import { TypeContainerService } from '@ansyn/type-container';
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

@Injectable()
export class FiltersAppEffects {

    @Effect()
    initializeFilters$: Observable<any> = this.actions$
        .ofType(OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS)
        .map(toPayload)
        .withLatestFrom(this.store$.select('cases'))
        .switchMap(([overlays, casesState]: [Overlay[], ICasesState]) => {
            return this.filtersService.loadFilters().mergeMap((filters: Filter[]) => {
                let actionsArray = [];
                let filterMetadatas: Map<Filter, FilterMetadata> = new Map<Filter, FilterMetadata>();

                filters.forEach((filter: Filter) => {
                    const metadata: FilterMetadata = this.initializeMetadata(filter, casesState);

                    actionsArray.push(new SetFilter({
                        filteringParams: { key: filter.modelName, metadata: metadata },
                        filterFunc: metadata.filterFunc
                    }));

                    overlays.forEach((overlay: Overlay) => {
                        metadata.accumulateData(overlay[filter.modelName]);
                    });

                    filterMetadatas.set(filter, metadata);
                });

                actionsArray.push(new InitializeFiltersAction(filterMetadatas));
                return Observable.from(actionsArray);
            });
        }).share();

    @Effect()
    updateFilters$: Observable<any> = this.actions$
        .ofType(FiltersActionTypes.UPDATE_FILTER_METADATA)
        .map(toPayload)
        .withLatestFrom(this.store$.select('cases'))
        .mergeMap(([payload, casesState]: [{ filter: Filter, newMetadata: FilterMetadata }, ICasesState]) => {
            let actionsArray = [];

            actionsArray.push(new SetFilter({
                filteringParams: { key: payload.filter.modelName, metadata: payload.newMetadata },
                filterFunc: payload.newMetadata.filterFunc
            }));

            const selected_case: Case = this.updateSelectedCase(payload.filter, payload.newMetadata, casesState);

            actionsArray.push(new UpdateCaseAction(selected_case));

            return Observable.from(actionsArray);
        })
        .share();

    @Effect()
    resetFilters$: Observable<any> = this.actions$
        .ofType(CasesActionTypes.SELECT_CASE_BY_ID)
        .map((action) => {
            return new ResetFiltersAction();
        });

    constructor(private actions$: Actions,
        private store$: Store<IAppState>,
        private filtersService: FiltersService,
        private typeContainerService: TypeContainerService) { }

    initializeMetadata(filter: Filter, casesState: ICasesState): FilterMetadata {
        const metaData: FilterMetadata = this.typeContainerService.resolve(FilterMetadata, filter.type);
        const clonedMetadata: FilterMetadata = Object.assign(Object.create(metaData), metaData); //TODO: remove this when a non-singelton resolve will be available

        const currentFilterInit = casesState.selected_case.state.facets
            && casesState.selected_case.state.facets.filters.find(field => {
                return field.fieldName === filter.modelName;
            });

        clonedMetadata.initializeFilter(currentFilterInit && currentFilterInit.metadata);

        return clonedMetadata;
    }

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
