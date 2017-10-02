export abstract class FilterMetadata {
	type: string;

	enumsFields: Map<string, { count: number, isChecked: boolean }>;

	abstract initializeFilter(value: any): void;

	abstract accumulateData(value: any): void;

	abstract updateMetadata(value: any): void;

	abstract filterFunc(ovrelay: any, filteringParams: any): boolean;

	abstract getMetadataForOuterState(): any;

	abstract isFiltered(): boolean;

	abstract showAll(): void;
}
