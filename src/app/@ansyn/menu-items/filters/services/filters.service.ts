import { Inject, Injectable } from '@angular/core';
import { IFilter } from '../models/IFilter';
import { FilterType, IFilterModel, IOverlay, buildFilteredOverlays, mapValuesToArray } from '@ansyn/core';
import { Filters, IFiltersState } from '../reducer/filters.reducer';
import { FilterMetadata } from '../models/metadata/filter-metadata.interface';
import { ICaseFilter } from '../../../core/models/case.model';
import { EnumFilterMetadata, IEnumFiled } from '../models/metadata/enum-filter-metadata';
import { BooleanFilterMetadata } from '../models/metadata/boolean-filter-metadata';
import { cloneDeep } from 'lodash';

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

	static calculatePotentialOverlaysCount(model: string, metadata: FilterMetadata, overlays: Map<string, IOverlay>, favoriteOverlays: IOverlay[], removedOverlaysIds: string[], removedOverlaysVisibility: boolean, filterState: IFiltersState): void {
		// const cloneMetadata = cloneDeep(metadata);
		//
		// if (metadata instanceof EnumFilterMetadata) {
		// 	Array.from(metadata.models[model])
		// 		.filter(([enumFiledKey, { isChecked }]: [string, IEnumFiled]) => !isChecked)
		// 		.forEach(([enumFiledKey, value]: [any, IEnumFiled]) => {
		// 			(<EnumFilterMetadata>cloneMetadata).models[model].set(enumFiledKey, { ...value, isChecked: true });
		// 			this.calculateOverlaysCount(model, metadata, overlays, favoriteOverlays, removedOverlaysIds, removedOverlaysVisibility, filterState, (<EnumFilterMetadata>cloneMetadata));
		// 		});
		// } else {
		// 	if ((<BooleanFilterMetadata>metadata).models[model].true.value === false || (<BooleanFilterMetadata>metadata).models[model].false.value === false) {
		// 		(<BooleanFilterMetadata>cloneMetadata).models[model].true.value = true;
		// 		(<BooleanFilterMetadata>cloneMetadata).models[model].false.value = true;
		// 		this.calculateOverlaysCount(model, metadata, overlays, favoriteOverlays, removedOverlaysIds, removedOverlaysVisibility, filterState, cloneMetadata);
		// 	}
		// }
	}

	static calculateOverlaysCount(metadataKey: string, metadata: FilterMetadata, overlays: Map<string, IOverlay>, favoriteOverlays: IOverlay[], removedOverlaysIds: string[], removedOverlaysVisibility: boolean, filterState: IFiltersState, cloneMetadata: FilterMetadata): void {
		// const cloneFilters = new Map(filterState.filters);
		// cloneFilters.set(metadataKey, cloneMetadata);
		// const filterModels: IFilterModel[] = this.pluckFilterModels(cloneFilters);
		// const filteredOverlays: string[] = buildFilteredOverlays(mapValuesToArray(overlays), filterModels, removedOverlaysIds, removedOverlaysVisibility);
		// metadata.resetFilteredCount(metadataKey);
		// filteredOverlays
		// 	.map((id) => overlays.get(id))
		// 	.filter(Boolean)
		// 	.forEach((overlay) => metadata.incrementFilteredCount(metadataKey, overlay[metadataKey.modelName]));
	}

	constructor(@Inject(FilterMetadata) protected filterMetadata: FilterMetadata[]) {
	}

	buildCaseFilters(overlays: IOverlay[]): ICaseFilter[] {
		// this.filterMetadata.forEach((metadata: FilterMetadata) => {
		// 	metadata.initializeFilter(overlays);
		// });
		//
		// return this.filterMetadata.reduce((caseFilters: ICaseFilter[], metadata: FilterMetadata) => {
		// 	const outerStateMetadata: any = metadata.getMetadataForOuterState();
		// 	return [...caseFilters, ...outerStateMetadata];
		// }, []);
	}
}
