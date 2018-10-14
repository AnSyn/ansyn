import { Inject, Injectable } from '@angular/core';
import { IFiltersConfig } from '../models/filters-config';
import { IFilter } from '../models/IFilter';
import { buildFilteredOverlays, CaseFilters, IFilterModel, IOverlay } from '@ansyn/core';
import { cloneDeep } from 'lodash';
import { Filters, IFiltersState } from '../reducer/filters.reducer';
import { FilterMetadata } from '../models/metadata/filter-metadata.interface';
import { EnumFilterMetadata, IEnumFiled } from '../models/metadata/enum-filter-metadata';
import { BooleanFilterMetadata } from '../models/metadata/boolean-filter-metadata';
import { mapValuesToArray } from 'src/app/@ansyn/core/public_api';

export const filtersConfig = 'filtersConfig';

// @dynamic
@Injectable()
export class FiltersService {
	static buildCaseFilters(filters: Filters): CaseFilters {
		const caseFilters: CaseFilters = [];

		filters.forEach((newMetadata: FilterMetadata, filter: IFilter) => {
			const currentFilter: any = caseFilters.find(({ fieldName }) => fieldName === filter.modelName);
			const outerStateMetadata: any = newMetadata.getMetadataForOuterState();

			if (!currentFilter && Boolean(outerStateMetadata)) {
				const [fieldName, metadata] = [filter.modelName, outerStateMetadata];
				caseFilters.push({ fieldName, metadata, type: filter.type });
			} else if (currentFilter && Boolean(outerStateMetadata)) {
				currentFilter.metadata = outerStateMetadata;
			} else if (currentFilter && !Boolean(outerStateMetadata)) {
				const index = caseFilters.indexOf(currentFilter);
				caseFilters.splice(index, 1);
			}
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

	constructor(@Inject(filtersConfig) protected config: IFiltersConfig) {
	}

	getFilters(): IFilter[] {
		return this.config.filters;
	}

}
