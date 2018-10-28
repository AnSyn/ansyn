import { Inject, Injectable } from '@angular/core';
import { buildFilteredOverlays, cloneDeep, IFilterModel, IOverlay, mapValuesToArray } from '@ansyn/core';
import { IFiltersState } from '../reducer/filters.reducer';
import { FilterMetadata } from '../models/metadata/filter-metadata.interface';
import { EnumFilterMetadata, IEnumFiled } from '../models/metadata/enum-filter-metadata';
import { BooleanFilterMetadata } from '../models/metadata/boolean-filter-metadata';
import { union } from 'lodash';
import { FILTERS_PROVIDERS, IFiltersProviders } from '../models/metadata/filters-manager';

export const filtersConfig = 'filtersConfig';

// @dynamic
@Injectable({
	providedIn: 'root'
})
export class FiltersService {
	// static pluckFilterModels(filterMetadata: FilterMetadata[]): IFilterModel[] {
	// 	return filterMetadata.reduce((array: IFilterModel[], item: FilterMetadata): IFilterModel[] => {
	// 		const temp = Object.keys(item.models)
	// 			.map((key: string) => ({ key, filterFunc: item.filterFunc.bind(item) }));
	// 		return [...array, ...temp];
	// 	}, []);
	// }

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

	constructor(@Inject(FILTERS_PROVIDERS) protected filtersProviders: IFiltersProviders) {
	}

	buildFilteredOverlays(overlays: IOverlay[], removedOverlaysIds: string[], removedOverlaysVisibility: boolean): string[] {
		let parsedOverlays: IOverlay[] = [];
		const parsedFilters: IFilterModel[] = Object.values(this.filtersProviders);

		const filteredOverlays = overlays.filter((overlay) => parsedFilters.every(filter => filter.filterFunc(overlay, filter.key)));
		parsedOverlays = [...parsedOverlays, ...filteredOverlays];

		if (removedOverlaysVisibility) {
			parsedOverlays = parsedOverlays.filter((overlay) => !removedOverlaysIds.some((overlayId) => overlay.id === overlayId));
		}
		return union(parsedOverlays.map(({ id }) => id));
	}

	getFilteredCount() {
		return Object.values(this.filtersProviders).reduce((badgeNum: number, filterMetadata: FilterMetadata) => badgeNum + filterMetadata.filteredCount(), 0)
	}

}
