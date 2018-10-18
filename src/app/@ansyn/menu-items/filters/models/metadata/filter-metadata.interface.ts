import {
	CaseEnumFilterMetadata,
	CaseFilterMetadata,
	CaseFilters,
	FilterType,
	ICaseFilter,
	IOverlay
} from '@ansyn/core';
import { IFiltersConfig } from '../filters-config';
import { IFilter } from '../IFilter';

export interface IFilterModel<T = any> {
	[model: string]: T;
}

export abstract class FilterMetadata<M = any> {
	models: IFilterModel<M> = this.config.filters.reduce((obj, item: IFilter) => {
		if (item.type === this.type) {
			return { ...obj, [item.modelName]: this.initialModelObject() };
		}
		return obj;
	}, {});

	abstract initialModelObject(): M;

	abstract initializeFilter(overlays: IOverlay[], caseFilters?: ICaseFilter[]): void;

	abstract accumulateData(model: string, value: any): void;

	abstract incrementFilteredCount(model: string, value: any): void;

	abstract updateMetadata(model: string, value: any): void;

	abstract filterFunc(model: string, ovrelay: any, filteringParams: any): boolean;

	abstract getMetadataForOuterState(): any;

	abstract isFiltered(model: string): boolean;

	abstract resetFilteredCount(model: string): void;

	abstract showAll(model: string): void;

	abstract shouldBeHidden(model: string): boolean;

	constructor(protected type: FilterType, protected config: IFiltersConfig) {
	}

}

