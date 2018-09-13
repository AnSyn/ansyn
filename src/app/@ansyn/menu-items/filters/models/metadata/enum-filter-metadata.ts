import { FilterMetadata } from './filter-metadata.interface';
import { IFilter } from '../IFilter';
import { FilterType } from '@ansyn/core';

export interface IEnumFiled {
	count: number;
	filteredCount: number;
	isChecked: boolean;
	disabled?: boolean;
}

export class EnumFilterMetadata implements FilterMetadata {

	enumsFields: Map<string, IEnumFiled>;
	type: FilterType;

	constructor() {
		this.enumsFields = new Map<string, IEnumFiled>();
		this.type = FilterType.Enum;
	}

	updateMetadata(key: string): void {
		if (this.enumsFields.get(key)) {
			this.enumsFields.get(key).isChecked = !this.enumsFields.get(key).isChecked;
		}
	}

	selectOnly(selectedKey: string): void {
		this.enumsFields.forEach((value: IEnumFiled, key: string) => {
			value.isChecked = (key === selectedKey);
		});
	}

	accumulateData(value: string): void {
		if (!this.enumsFields.get(value)) {
			this.enumsFields.set(value, { count: 1, filteredCount: 0, isChecked: false });
		} else {
			this.enumsFields.get(value).count = this.enumsFields.get(value).count + 1;
		}
	}

	incrementFilteredCount(value: any): void {
		this.enumsFields.get(value).filteredCount = this.enumsFields.get(value).filteredCount + 1;
	}

	resetFilteredCount(): void {
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

	postInitializeFilter(value: { oldFiltersArray: [IFilter, EnumFilterMetadata][], modelName: string }): void {
		this.enumsFields.forEach((value, key, mapObj: Map<any, any>) => {
			if (!value.count) {
				mapObj.delete(key);
			}
		});

		if (value.oldFiltersArray) {
			const oldFilterArray = value.oldFiltersArray
				.find(([oldFilterKey, oldFilter]: [IFilter, FilterMetadata]) => oldFilterKey.modelName === value.modelName);


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
		return Array.from(this.enumsFields.values()).some((value: IEnumFiled) => !value.isChecked);
	}

	showAll(): void {
		this.enumsFields.forEach((value: IEnumFiled) => {
			value.isChecked = true;
		});
	}
}
