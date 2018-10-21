import {
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

	abstract initializeFilter(overlays: IOverlay[]): void;

	abstract accumulateData(model: string, value: any): void;

	abstract incrementFilteredCount(model: string, value: any): void;

	abstract updateMetadata(model: string, value: any): void;

	abstract filterFunc(model: string, ovrelay: any, filteringParams: any): boolean;

	abstract getMetadataForOuterState(): ICaseFilter[] ;

	abstract isFiltered(model: string): boolean;

	abstract resetFilteredCount(model: string): void;

	abstract showAll(model: string): void;

	abstract shouldBeHidden(model: string): boolean;

	constructor(public type: FilterType, protected config: IFiltersConfig) {
	}

	filteredCount() {
		return Object.keys(this.models).reduce((num, model: string) => {
			return this.isFiltered(model) ? num + 1 : num;
		}, 0)
	}

}

