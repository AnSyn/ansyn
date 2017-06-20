import { TypeContainerService } from '@ansyn/type-container';
import { OverlaysActionTypes, Overlay } from '@ansyn/overlays';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { IAppState } from '../app-reducers.module';
import { InitializeFiltersAction, FilterMetadata, FiltersService, Filter } from '@ansyn/menu-items/filters';

@Injectable()
export class FiltersAppEffects {

    @Effect()
    initializeFilters$: Observable<InitializeFiltersAction> = this.actions$
        .ofType(OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS)
        .map(toPayload)
        .switchMap((overlays: Overlay[]) => {
            return this.filtersService.loadFilters().map((filters: Filter[]) => {
                let filterMetadatas: Map<Filter, FilterMetadata> = new Map<Filter, FilterMetadata>();

                filters.forEach((filter: Filter) => {
                    const metaData: FilterMetadata = this.typeContainerService.resolve(FilterMetadata, filter.type);
                    metaData.resetMetadata();

                    overlays.forEach((overlay: Overlay) => {
                        metaData.updateMetadata(overlay[filter.modelName]);
                    });

                    filterMetadatas.set(filter, metaData);
                });
                return new InitializeFiltersAction(filterMetadatas);
            });
        }).share();

    constructor(private actions$: Actions,
        private store$: Store<IAppState>,
        private filtersService: FiltersService,
        private typeContainerService: TypeContainerService) { }
}
