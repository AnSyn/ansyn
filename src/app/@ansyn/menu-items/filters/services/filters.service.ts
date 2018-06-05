import { Inject, Injectable, InjectionToken } from '@angular/core';
import { IFiltersConfig } from '../models/filters-config';
import { Filter } from '../models/filter';
import 'rxjs/add/observable/of';
import { Filters, IFiltersState } from '@ansyn/menu-items/filters/reducer/filters.reducer';
import { FilterMetadata } from '@ansyn/menu-items/filters/models/metadata/filter-metadata.interface';
import { CaseFilters } from '@ansyn/core/models/case.model';
import { FilterModel } from '@ansyn/core/models/filter.model';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { BooleanFilterMetadata } from '@ansyn/menu-items/filters/models/metadata/boolean-filter-metadata';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { cloneDeep } from 'lodash';
import { EnumFiled, EnumFilterMetadata } from '@ansyn/menu-items/filters/models/metadata/enum-filter-metadata';

export const filtersConfig: InjectionToken<IFiltersConfig> = new InjectionToken('filtersConfig');

@Injectable()
export class FiltersService {
	static buildCaseFilters(filters: Filters): CaseFilters {
		const caseFilters: CaseFilters = [];

		filters.forEach((newMetadata: FilterMetadata, filter: Filter) => {
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

	static pluckFilterModels(filters: Filters): FilterModel[] {
		return Array.from(filters).map(([key, value]): FilterModel => ({
			key: key.modelName,
			filterFunc: value.filterFunc.bind(value)
		}));
	}

	static calculatePotentialOverlaysCount(metadataKey: Filter, metadata: FilterMetadata, overlays: Map<string, Overlay>, favoriteOverlays: Overlay[], filterState: IFiltersState): void {
		const cloneMetadata = cloneDeep(metadata);

		if (metadata instanceof EnumFilterMetadata) {
			Array.from(metadata.enumsFields)
				.filter(([enumFiledKey, { isChecked }]: [any, EnumFiled]) => !isChecked)
				.forEach(([enumFiledKey, value]: [any, EnumFiled]) => {
					(<EnumFilterMetadata>cloneMetadata).enumsFields.set(enumFiledKey, { ...value, isChecked: true });
					FiltersService.calculateOverlaysCount(metadataKey, metadata, overlays, favoriteOverlays, filterState, (<EnumFilterMetadata>cloneMetadata));
				});
		} else {
			if ((<BooleanFilterMetadata>metadata).properties.true.value === false || (<BooleanFilterMetadata>metadata).properties.false.value === false) {
				(<BooleanFilterMetadata>cloneMetadata).properties.true.value = true;
				(<BooleanFilterMetadata>cloneMetadata).properties.false.value = true;
				FiltersService.calculateOverlaysCount(metadataKey, metadata, overlays, favoriteOverlays, filterState, cloneMetadata);
			}
		}
	}

	static calculateOverlaysCount(metadataKey: Filter, metadata: FilterMetadata, overlays: Map<string, Overlay>, favoriteOverlays: Overlay[], filterState: IFiltersState, cloneMetadata: FilterMetadata): void {
		const cloneFilters = new Map(filterState.filters);
		cloneFilters.set(metadataKey, cloneMetadata);
		const filterModels: FilterModel[] = FiltersService.pluckFilterModels(cloneFilters);
		const filteredOverlays: string[] = OverlaysService.buildFilteredOverlays(Array.from(overlays.values()), filterModels, favoriteOverlays, filterState.facets.showOnlyFavorites, <any> { time: null });
		metadata.resetFilteredCount();
		filteredOverlays.forEach((id: string) => {
			const overlay = overlays.get(id);
			metadata.incrementFilteredCount(overlay[metadataKey.modelName]);
		});
	}

	constructor(@Inject(filtersConfig) protected config: IFiltersConfig) {
	}

	getFilters(): Filter[] {
		return this.config.filters;
	}

}
