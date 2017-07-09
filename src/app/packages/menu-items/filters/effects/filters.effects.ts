import { TypeContainerService } from '@ansyn/type-container';
import { FilterMetadata } from '../models/metadata/filter-metadata.interface';
import { FiltersActionTypes, InitializeFiltersAction, InitializeFiltersSuccessAction } from '../actions/filters.actions';
import { IFiltersState } from '../reducer/filters.reducer';
import { FiltersService } from '../services/filters.service';
import { Filter } from '../models/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class FiltersEffects {

    @Effect()
    initializeFilters$: Observable<InitializeFiltersSuccessAction> = this.actions$
        .ofType(FiltersActionTypes.INITIALIZE_FILTERS)
        .switchMap((action: InitializeFiltersAction) => {
            return this.filtersService.loadFilters().map((filters: Filter[]) => {
                const filterMetadatas: Map<Filter, FilterMetadata> = new Map<Filter, FilterMetadata>();
                filters.forEach((filter: Filter) => {
                    const metadata: FilterMetadata = this.initializeMetadata(filter, action.payload.facets);
                    action.payload.overlays.forEach((overlay: any) => {
                        metadata.accumulateData(overlay[filter.modelName]);
                    });
                    filterMetadatas.set(filter, metadata);
                });
                return new InitializeFiltersSuccessAction(filterMetadatas);
            });
        }).share();

    constructor(private actions$: Actions,
        private filtersService: FiltersService,
        private store: Store<IFiltersState>,
        private typeContainerService: TypeContainerService) { }

    initializeMetadata(filter: Filter, facets: { filters: { fieldName: string, metadata: any }[] }): FilterMetadata {
        const metaData: FilterMetadata = this.typeContainerService.resolve(FilterMetadata, filter.type);
        const clonedMetadata: FilterMetadata = Object.assign(Object.create(metaData), metaData); //TODO: remove this when a non-singelton resolve will be available

        const currentFilterInit = facets
            && facets.filters.find(field => {
                return field.fieldName === filter.modelName;
            });

        clonedMetadata.initializeFilter(currentFilterInit && currentFilterInit.metadata);

        return clonedMetadata;
    }
}

