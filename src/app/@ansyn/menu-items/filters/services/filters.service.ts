import { Inject, Injectable, InjectionToken } from '@angular/core';
import { IFiltersConfig } from '../models/filters-config';
import { IFilter } from '../models/IFilter';
import 'rxjs/add/observable/of';
import { Filters, IFiltersState } from '@ansyn/menu-items/filters/reducer/filters.reducer';
import { FilterMetadata } from '@ansyn/menu-items/filters/models/metadata/filter-metadata.interface';
import { CaseFilters } from '@ansyn/core/models/case.model';
import { IFilterModel } from '@ansyn/core/models/IFilterModel';
import { IOverlay } from '@ansyn/core/models/overlay.model';
import { BooleanFilterMetadata } from '@ansyn/menu-items/filters/models/metadata/boolean-filter-metadata';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { cloneDeep } from 'lodash';
import { IEnumFiled, EnumFilterMetadata } from '@ansyn/menu-items/filters/models/metadata/enum-filter-metadata';

export const filtersConfig: InjectionToken<IFiltersConfig> = new InjectionToken('filtersConfig');

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
		const filteredOverlays: string[] = OverlaysService.buildFilteredOverlays(Array.from(overlays.values()), filterModels, favoriteOverlays, filterState.facets.showOnlyFavorites);
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
