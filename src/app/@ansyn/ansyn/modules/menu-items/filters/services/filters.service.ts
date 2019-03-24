import { Injectable } from '@angular/core';
import { IFilter } from '../models/IFilter';
import { buildFilteredOverlays, FilterType, ICaseFilter, IFilterModel, IOverlay, mapValuesToArray } from '../../../core/public_api';
import { cloneDeep } from 'lodash';
import { Filters, IFiltersState } from '../reducer/filters.reducer';
import { FilterMetadata } from '../models/metadata/filter-metadata.interface';
import { EnumFilterMetadata, IEnumFiled } from '../models/metadata/enum-filter-metadata';
import { BooleanFilterMetadata } from '../models/metadata/boolean-filter-metadata';

export const filtersConfig = 'filtersConfig';

// @dynamic
@Injectable({
	providedIn: 'root'
})
export class FiltersService {
	static buildCaseFilters(filters: Filters, facetsFilters?: ICaseFilter[]): ICaseFilter[] {
		const caseFilters: ICaseFilter[] = [];

		filters.forEach((newMetadata: FilterMetadata, filter: IFilter) => {
			let outerStateMetadata: any = newMetadata.getMetadataForOuterState();
			const historyEnumFilter = facetsFilters.find(({ type, fieldName }) => type === FilterType.Enum && fieldName === filter.modelName)
			if (historyEnumFilter) {
				const facetsFilterToContact = (<string[]>historyEnumFilter.metadata).filter((key) => {
					return !(<any>newMetadata).enumsFields.has(key)
				});
				outerStateMetadata = outerStateMetadata.concat(facetsFilterToContact);
			}
			caseFilters.push({ fieldName: filter.modelName, metadata: outerStateMetadata, type: filter.type });
		});
		return caseFilters;
	}

	static pluckFilterModels(filters: Filters): IFilterModel[] {
		return Array.from(filters).map(([key, value]): IFilterModel => ({
			key: key.modelName,
			filterFunc: value.filterFunc.bind(value)
		}));
	}

	static calculatePotentialOverlaysCount(metadataKey: IFilter, metadata: FilterMetadata, overlays: Map<string, IOverlay>, favoriteOverlays: IOverlay[], removedOverlaysIds: string[], removedOverlaysVisibility: boolean, filterState: IFiltersState): void {
		const cloneMetadata = cloneDeep(metadata);

		if (metadata instanceof EnumFilterMetadata) {
			Array.from(metadata.enumsFields)
				.filter(([enumFiledKey, { isChecked }]: [any, IEnumFiled]) => !isChecked)
				.forEach(([enumFiledKey, value]: [any, IEnumFiled]) => {
					(<EnumFilterMetadata>cloneMetadata).enumsFields.set(enumFiledKey, { ...value, isChecked: true });
					this.calculateOverlaysCount(metadataKey, metadata, overlays, favoriteOverlays, removedOverlaysIds, removedOverlaysVisibility, filterState, (<EnumFilterMetadata>cloneMetadata));
				});
		} else {
			if ((<BooleanFilterMetadata>metadata).properties.true.value === false || (<BooleanFilterMetadata>metadata).properties.false.value === false) {
				(<BooleanFilterMetadata>cloneMetadata).properties.true.value = true;
				(<BooleanFilterMetadata>cloneMetadata).properties.false.value = true;
				this.calculateOverlaysCount(metadataKey, metadata, overlays, favoriteOverlays, removedOverlaysIds, removedOverlaysVisibility, filterState, cloneMetadata);
			}
		}
	}

	static calculateOverlaysCount(metadataKey: IFilter, metadata: FilterMetadata, overlays: Map<string, IOverlay>, favoriteOverlays: IOverlay[], removedOverlaysIds: string[], removedOverlaysVisibility: boolean, filterState: IFiltersState, cloneMetadata: FilterMetadata): void {
		const cloneFilters = new Map(filterState.filters);
		cloneFilters.set(metadataKey, cloneMetadata);
		const filterModels: IFilterModel[] = this.pluckFilterModels(cloneFilters);
		const filteredOverlays: string[] = buildFilteredOverlays(mapValuesToArray(overlays), filterModels, removedOverlaysIds, removedOverlaysVisibility);
		metadata.resetFilteredCount();
		filteredOverlays
			.map((id) => overlays.get(id))
			.filter(Boolean)
			.forEach((overlay) => metadata.incrementFilteredCount(overlay[metadataKey.modelName]));
	}

}
