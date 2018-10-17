import { FilterMetadata } from './filter-metadata.interface';
import { FilterType, mapValuesToArray } from '@ansyn/core';

export interface IEnumFiled {
	count: number;
	filteredCount: number;
	isChecked: boolean;
	disabled?: boolean;
}

export class EnumFilterMetadata implements FilterMetadata {
	enumsFields: Map<string, IEnumFiled> = new Map<string, IEnumFiled>();
	type: FilterType = FilterType.Enum;

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
			this.enumsFields.set(value, { count: 1, filteredCount: 0, isChecked: true });
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

	initializeFilter(): void {
		this.enumsFields = new Map<string, IEnumFiled>();
	}

	postInitializeFilter(selectedValues: string[]): void {
		if (selectedValues) {
			selectedValues
				.map(key => this.enumsFields.get(key))
				.filter(Boolean)
				.forEach((enumsField: IEnumFiled) => enumsField.isChecked = false);
		}
	}

	filterFunc(overlay: any, key: string): boolean {
		if (!overlay) {
			return false;
		}
		const selectedFields: string[] = [];
		this.enumsFields.forEach(({ isChecked }: IEnumFiled, key: string) => {
			if (isChecked) {
				selectedFields.push(key);
			}
		});

		return selectedFields.some((filterParams) => overlay[key] === filterParams);
	}

	getMetadataForOuterState(): string[] {
		const returnValue: string[] = [];

		this.enumsFields.forEach((value: { count: number, isChecked: boolean }, key: string) => {
			if (!value.isChecked) {
				returnValue.push(key);
			}
		});

		return returnValue;
	}

	isFiltered(): boolean {
		return mapValuesToArray(this.enumsFields).some((value: IEnumFiled) => !value.isChecked);
	}

	showAll(): void {
		this.enumsFields.forEach((value: IEnumFiled) => {
			value.isChecked = true;
		});
	}
	shouldBeHidden(): boolean {
		return false;
	}
}
