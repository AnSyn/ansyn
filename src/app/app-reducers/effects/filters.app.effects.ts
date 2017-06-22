import { TypeContainerService } from '@ansyn/type-container';
import { OverlaysActionTypes, Overlay } from '@ansyn/overlays';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { IAppState } from '../app-reducers.module';
import { InitializeFiltersAction, FilterMetadata, FiltersService, Filter } from '@ansyn/menu-items/filters';
import { ICasesState } from '@ansyn/menu-items/cases';

@Injectable()
export class FiltersAppEffects {

    @Effect()
    initializeFilters$: Observable<InitializeFiltersAction> = this.actions$
        .ofType(OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS)
        .map(toPayload)
        .withLatestFrom(this.store$.select('cases'))
        .switchMap(([overlays, casesState]: [Overlay[], ICasesState]) => {
            return this.filtersService.loadFilters().map((filters: Filter[]) => {
                let filterMetadatas: Map<Filter, FilterMetadata> = new Map<Filter, FilterMetadata>();

                filters.forEach((filter: Filter) => {
                    const metaData: FilterMetadata = this.typeContainerService.resolve(FilterMetadata, filter.type);
                    const clonedMetadata: FilterMetadata = Object.assign(Object.create(metaData), metaData); //TODO: remove this when a non-singelton resolve will be available

                    const currentFilterInit = casesState.selected_case.state.facets.enumFields.find(field => {
                        return field.fieldName === filter.modelName;
                    });

                    clonedMetadata.initializeFilter(currentFilterInit && currentFilterInit.selectedValues);

                    overlays.forEach((overlay: Overlay) => {
                        clonedMetadata.updateMetadata(overlay[filter.modelName]);
                    });

                    filterMetadatas.set(filter, clonedMetadata);
                });
                return new InitializeFiltersAction(filterMetadatas);
            });
        }).share();

    constructor(private actions$: Actions,
        private store$: Store<IAppState>,
        private filtersService: FiltersService,
        private typeContainerService: TypeContainerService) { }
}
