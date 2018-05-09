import { FilterMetadata } from './filter-metadata.interface';
import { Filter } from '../filter';
import { FilterType } from '@ansyn/core/models/case.model';

export interface EnumFiled {
	count: number;
	filteredCount: number;
	isChecked: boolean;
}

export class EnumFilterMetadata implements FilterMetadata {

	enumsFields: Map<string, EnumFiled>;
	type: FilterType;

	constructor() {
		this.enumsFields = new Map<string, EnumFiled>();
		this.type = FilterType.Enum;
	}

	updateMetadata(key: string): void {
		if (this.enumsFields.get(key)) {
			this.enumsFields.get(key).isChecked = !this.enumsFields.get(key).isChecked;
		}
	}

	selectOnly(selectedKey: string): void {
		this.enumsFields.forEach((value: EnumFiled, key: string) => {
			value.isChecked = (key === selectedKey);
		});
	}

	accumulateData(value: any, calculateFiltered?: Boolean): void {
		if (!this.enumsFields.get(value)) {
			this.enumsFields.set(value, { count: 1, filteredCount: 0, isChecked: false });
		} else {
			if (calculateFiltered) {
				this.enumsFields.get(value).filteredCount = this.enumsFields.get(value).filteredCount + 1;
			} else {
				this.enumsFields.get(value).count = this.enumsFields.get(value).count + 1;
			}
		}
	}

	resetFilterCount(): void {
		this.enumsFields.forEach((val, key) => {
			val.filteredCount = 0;
		});
	}

	initializeFilter(selectedValues: string[]): void {
		this.enumsFields = new Map<string, { count: number, filteredCount: number, isChecked: boolean }>();
		if (selectedValues) {
			for (let key of selectedValues) {
				this.enumsFields.set(key, { count: 0, filteredCount: 0, isChecked: true });
			}
		}
	}

	postInitializeFilter(value: { oldFiltersArray: [Filter, EnumFilterMetadata][], modelName: string }): void {
		this.enumsFields.forEach((value, key, mapObj: Map<any, any>) => {
			if (!value.count) {
				mapObj.delete(key);
			}
		});

		if (value.oldFiltersArray) {
			const oldFilterArray = value.oldFiltersArray
				.find(([oldFilterKey, oldFilter]: [Filter, FilterMetadata]) => oldFilterKey.modelName === value.modelName);


			if (oldFilterArray) {
				const [oldFilterKey, oldFilter] = oldFilterArray;
				const oldFilterFields = (<EnumFilterMetadata>oldFilter).enumsFields;
				const filterFields = this.enumsFields;

				filterFields.forEach((value, key) => {
					let isChecked = true;
					if (oldFilterFields.has(key)) {
						const oldFilter = oldFilterFields.get(key);
						if (!oldFilter.isChecked) {
							isChecked = false;
						}
					}
					value.isChecked = isChecked;
				});
			}
		}
	}

	filterFunc(overlay: any, key: string): boolean {
		if (!overlay) {
			return false;
		}
		const selectedFields: string[] = [];
		this.enumsFields.forEach((value: { count: number, isChecked: boolean }, key: string) => {
			if (value.isChecked) {
				selectedFields.push(key);
			}
		});

		return selectedFields.some((filterParams) => overlay[key] === filterParams);
	}

	getMetadataForOuterState(): string[] {
		const returnValue: string[] = [];

		this.enumsFields.forEach((value: { count: number, isChecked: boolean }, key: string) => {
			if (value.isChecked) {
				returnValue.push(key);
			}
		});

		return returnValue;
	}

	isFiltered(): boolean {
		return Array.from(this.enumsFields.values()).some((value: EnumFiled) => !value.isChecked);
	}

	showAll(): void {
		this.enumsFields.forEach((value: EnumFiled) => {
			value.isChecked = true;
		});
	}
}
