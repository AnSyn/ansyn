import { FilterMetadata } from './filter-metadata.interface';
import { Filter } from '../filter';

export class EnumFilterMetadata implements FilterMetadata {

	enumsFields: Map<string, { count: number, isChecked: boolean }>;
	type: string;

	constructor() {
		this.enumsFields = new Map<string, { count: number, isChecked: boolean }>();
		this.type = 'Enum';
	}

	updateMetadata(key: string): void {
		if (this.enumsFields.get(key)) {
			this.enumsFields.get(key).isChecked = !this.enumsFields.get(key).isChecked;
		}
	}

	selectOnly(selectedKey: string): void {
		this.enumsFields.forEach((value: { count: number, isChecked: boolean }, key: string) => {
			value.isChecked = (key === selectedKey);
		});
	}

	accumulateData(value: any): void {
		if (!this.enumsFields.get(value)) {
			this.enumsFields.set(value, { count: 1, isChecked: false });
		} else {
			this.enumsFields.get(value).count = this.enumsFields.get(value).count + 1;
		}
	}

	initializeFilter(selectedValues: string[]): void {

		this.enumsFields = new Map<string, { count: number, isChecked: boolean }>();
		if (selectedValues) {
			for (let key of selectedValues) {
				this.enumsFields.set(key, { count: 0, isChecked: true });
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
				const oldFilterFields = oldFilter.enumsFields;
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

	filterFunc(overlay: any, filteringParams: { key: string, metadata: EnumFilterMetadata }): boolean {
		if (!overlay) {
			return false;
		}
		const selectedFields: string[] = [];
		filteringParams.metadata.enumsFields.forEach((value: { count: number, isChecked: boolean }, key: string) => {
			if (value.isChecked) {
				selectedFields.push(key);
			}
		});

		return selectedFields.some((filterParams) => overlay[filteringParams.key] === filterParams);
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
		return Array.from(this.enumsFields.values()).some((value: { count: number, isChecked: boolean }) => value.isChecked);
	}

	showAll(): void {
		this.enumsFields.forEach((value: { count: number, isChecked: boolean }, key: string) => {
			value.isChecked = true;
		});
	}
}
