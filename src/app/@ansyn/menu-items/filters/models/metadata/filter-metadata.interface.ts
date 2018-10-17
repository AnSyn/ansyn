import { FilterType, IOverlay } from '@ansyn/core';

export abstract class FilterMetadata {
	type: FilterType;

	abstract initializeFilter(overlays: IOverlay[], modelName: string, selectedValues: any): void;

	abstract accumulateData(value: any): void;

	abstract incrementFilteredCount(value: any): void;

	abstract updateMetadata(value: any): void;

	abstract filterFunc(ovrelay: any, filteringParams: any): boolean;

	abstract getMetadataForOuterState(): any;

	abstract isFiltered(): boolean;

	abstract resetFilteredCount(): void;

	abstract showAll(): void;

	abstract shouldBeHidden(): boolean;
}

