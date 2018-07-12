import { IFilter } from '../IFilter';
import { FilterType } from '@ansyn/core/models/case.model';

export abstract class FilterMetadata {
	type: FilterType;

	abstract initializeFilter(value: any, filter?: IFilter): void;

	abstract accumulateData(value: any): void;

	abstract incrementFilteredCount(value: any): void;

	abstract postInitializeFilter(value: any): void;

	abstract updateMetadata(value: any): void;

	abstract filterFunc(ovrelay: any, filteringParams: any): boolean;

	abstract getMetadataForOuterState(): any;

	abstract isFiltered(): boolean;

	abstract resetFilteredCount(): void;

	abstract showAll(): void;
}

