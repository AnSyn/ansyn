import { Injectable } from '@angular/core';
import { IFilter } from '../models/IFilter';
import { clone, cloneDeep, get as _get } from 'lodash';
import { Filters, IFiltersState } from '../reducer/filters.reducer';
import { FilterMetadata } from '../models/metadata/filter-metadata.interface';
import { EnumFilterMetadata, IEnumFiled } from '../models/metadata/enum-filter-metadata';
import { BooleanFilterMetadata } from '../models/metadata/boolean-filter-metadata';
import { buildFilteredOverlays } from '../../core/utils/overlays';
import { mapValuesToArray } from '../../core/utils/misc';
import { IFilterModel } from '../../core/models/IFilterModel';
import { FilterType } from '../models/filter-type';
import { ICaseEnumFilterMetadata, ICaseFacetsState, ICaseFilter } from '../../menu-items/cases/models/case.model';
import { IOverlay } from '../../overlays/models/overlay.model';

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
			const historyEnumFilter = facetsFilters.find(({ type, fieldName }) => type === FilterType.Enum && fieldName === filter.modelName);
			if (historyEnumFilter) {
				const oldMetaData: ICaseEnumFilterMetadata = <ICaseEnumFilterMetadata>historyEnumFilter.metadata;
				const facetsFilterToContact = oldMetaData.unCheckedEnums.filter((key) => {
					return !(<any>newMetadata).enumsFields.has(key)
				});

				const facetsDisabledFilterToContact = oldMetaData.disabledEnums.filter((key) => {
					return !(<any>newMetadata).enumsFields.has(key)
				});
				const enumMetaData: ICaseEnumFilterMetadata = {
					unCheckedEnums: outerStateMetadata.unCheckedEnums.concat(facetsFilterToContact),
					disabledEnums: outerStateMetadata.disabledEnums.concat(facetsDisabledFilterToContact)
				};
				outerStateMetadata = enumMetaData;
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

	static calculatePotentialOverlaysCount(metadataKey: IFilter, metadata: FilterMetadata, overlays: Map<string, IOverlay>, favoriteOverlays: IOverlay[], filterState: IFiltersState): void {
		const cloneMetadata = cloneDeep(metadata);

		if (metadata instanceof EnumFilterMetadata) {
			Array.from(metadata.enumsFields)
				.filter(([enumFiledKey, { isChecked }]: [any, IEnumFiled]) => !isChecked)
				.forEach(([enumFiledKey, value]: [any, IEnumFiled]) => {
					(<EnumFilterMetadata>cloneMetadata).enumsFields.set(enumFiledKey, { ...value, isChecked: true });
					this.calculateOverlaysCount(metadataKey, metadata, overlays, favoriteOverlays, filterState, (<EnumFilterMetadata>cloneMetadata));
				});
		} else {
			if ((<BooleanFilterMetadata>metadata).properties.true.value === false || (<BooleanFilterMetadata>metadata).properties.false.value === false) {
				(<BooleanFilterMetadata>cloneMetadata).properties.true.value = true;
				(<BooleanFilterMetadata>cloneMetadata).properties.false.value = true;
				this.calculateOverlaysCount(metadataKey, metadata, overlays, favoriteOverlays, filterState, cloneMetadata);
			}
		}
	}

	static calculateOverlaysCount(metadataKey: IFilter, metadata: FilterMetadata, overlays: Map<string, IOverlay>, favoriteOverlays: IOverlay[], filterState: IFiltersState, cloneMetadata: FilterMetadata): void {
		const cloneFilters = new Map(filterState.filters);
		cloneFilters.set(metadataKey, cloneMetadata);
		const filterModels: IFilterModel[] = this.pluckFilterModels(cloneFilters);
		const filteredOverlays: string[] = buildFilteredOverlays(mapValuesToArray(overlays), filterModels);
		metadata.resetFilteredCount();
		filteredOverlays
			.map((id) => overlays.get(id))
			.filter(Boolean)
			.forEach((overlay) => metadata.incrementFilteredCount(_get(overlay, metadataKey.modelName)));
	}

	static getFilterByFilterModel(filterModel: string, filters: Filters): IFilter {
		const filtersArray = Array.from(filters.keys());
		const resultFilter = filtersArray.find((filter: IFilter) => {
			return filter.modelName === filterModel;
		});
		return resultFilter;
	}

	static getRefreshedFilterDataByFilterModel(filterModel: string, filters: Filters, facets: ICaseFacetsState, overlays: IOverlay[]): { filter: IFilter, filterMetadata: FilterMetadata } {
		const filter: IFilter = FiltersService.getFilterByFilterModel(filterModel, filters);
		if (!filter) {
			return null;
		}
		const metadata: FilterMetadata = filters.get(filter);
		const filterMetadata = clone(metadata)
		const selectedFilter: ICaseFilter = facets.filters.find(({ fieldName }) => fieldName === filter.modelName);
		filterMetadata.initializeFilter(overlays, filter.modelName, selectedFilter, filter.visibility);
		return { filter, filterMetadata };
	}
}
