import { Inject, Injectable } from '@angular/core';
import { IFilter } from '../models/IFilter';
import { FilterType, IFilterModel, IOverlay } from '@ansyn/core';
import { Filters, IFiltersState } from '../reducer/filters.reducer';
import { FilterMetadata } from '../models/metadata/filter-metadata.interface';
import { ICaseFilter } from '../../../core/models/case.model';

export const filtersConfig = 'filtersConfig';

// @dynamic
@Injectable({
	providedIn: 'root'
})
export class FiltersService {
	static pluckFilterModels(filterMetadata: FilterMetadata[]): IFilterModel[] {
		return filterMetadata.reduce((array: IFilterModel[], item: FilterMetadata): IFilterModel[] => {
			const temp = Object.keys(item.models)
				.map((key: string) => ({ key, filterFunc: item.filterFunc.bind(item) }));
			return [...array, ...temp];
		}, []);
	}

	static calculatePotentialOverlaysCount(metadataKey: IFilter, metadata: FilterMetadata, overlays: Map<string, IOverlay>, favoriteOverlays: IOverlay[], removedOverlaysIds: string[], removedOverlaysVisibility: boolean, filterState: IFiltersState): void {
		// const cloneMetadata = cloneDeep(metadata);
		//
		// if (metadata instanceof EnumFilterMetadata) {
		// 	Array.from(metadata.enumsFields)
		// 		.filter(([enumFiledKey, { isChecked }]: [any, IEnumFiled]) => !isChecked)
		// 		.forEach(([enumFiledKey, value]: [any, IEnumFiled]) => {
		// 			(<EnumFilterMetadata>cloneMetadata).enumsFields.set(enumFiledKey, { ...value, isChecked: true });
		// 			this.calculateOverlaysCount(metadataKey, metadata, overlays, favoriteOverlays, removedOverlaysIds, removedOverlaysVisibility, filterState, (<EnumFilterMetadata>cloneMetadata));
		// 		});
		// } else {
		// 	if ((<BooleanFilterMetadata>metadata).properties.true.value === false || (<BooleanFilterMetadata>metadata).properties.false.value === false) {
		// 		(<BooleanFilterMetadata>cloneMetadata).properties.true.value = true;
		// 		(<BooleanFilterMetadata>cloneMetadata).properties.false.value = true;
		// 		this.calculateOverlaysCount(metadataKey, metadata, overlays, favoriteOverlays, removedOverlaysIds, removedOverlaysVisibility, filterState, cloneMetadata);
		// 	}
		// }
	}

	static calculateOverlaysCount(metadataKey: IFilter, metadata: FilterMetadata, overlays: Map<string, IOverlay>, favoriteOverlays: IOverlay[], removedOverlaysIds: string[], removedOverlaysVisibility: boolean, filterState: IFiltersState, cloneMetadata: FilterMetadata): void {
		// const cloneFilters = new Map(filterState.filters);
		// cloneFilters.set(metadataKey, cloneMetadata);
		// const filterModels: IFilterModel[] = this.pluckFilterModels(cloneFilters);
		// const filteredOverlays: string[] = buildFilteredOverlays(mapValuesToArray(overlays), filterModels, removedOverlaysIds, removedOverlaysVisibility);
		// metadata.resetFilteredCount();
		// filteredOverlays
		// 	.map((id) => overlays.get(id))
		// 	.filter(Boolean)
		// 	.forEach((overlay) => metadata.incrementFilteredCount(overlay[metadataKey.modelName]));
	}

	constructor(@Inject(FilterMetadata) protected filterMetadata: FilterMetadata[]) {
	}

	buildCaseFilters(overlays: IOverlay[]): ICaseFilter[] {
		this.filterMetadata.forEach((metadata: FilterMetadata) => {
			metadata.initializeFilter(overlays);
		});

		return this.filterMetadata.reduce((caseFilters: ICaseFilter[], metadata: FilterMetadata) => {
			const outerStateMetadata: any = metadata.getMetadataForOuterState();
			return [...caseFilters, ...outerStateMetadata];
		}, []);
	}
}
