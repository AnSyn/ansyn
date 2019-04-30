import { FilterMetadata } from './filter-metadata.interface';
import { mapValuesToArray } from '../../../../core/utils/misc';
import { CaseEnumFilterMetadata, ICaseFilter } from '../../../../../../../app/cases/models/case.model';
import { FilterType } from '../filter-type';
import { IOverlay } from '../../../../overlays/models/overlay.model';

export interface IEnumFiled {
	key: string;
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
			this.enumsFields.set(value, { count: 1, filteredCount: 0, isChecked: true, key: value });
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

	initializeFilter(overlays: IOverlay[], modelName: string, caseFilter?: ICaseFilter<CaseEnumFilterMetadata>): void {
		this.enumsFields = new Map<string, IEnumFiled>();

		overlays.forEach((overlay: any) => {
			this.accumulateData(overlay[modelName]);
		});

		if (caseFilter) {
			if (caseFilter.positive) {
				this.enumsFields.forEach((enumsField: IEnumFiled) => {
					enumsField.isChecked = caseFilter.metadata.includes(enumsField.key);
				});
			} else {
				caseFilter.metadata
					.map(key => this.enumsFields.get(key))
					.filter(Boolean)
					.forEach((enumsField: IEnumFiled) => enumsField.isChecked = false);
			}
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
