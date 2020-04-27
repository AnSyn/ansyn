import { FilterMetadata } from './filter-metadata.interface';
import { mapValuesToArray } from '../../../core/utils/misc';
import { ICaseEnumFilterMetadata, ICaseFilter } from '../../../menu-items/cases/models/case.model';
import { FilterType } from '../filter-type';
import { IOverlay } from '../../../overlays/models/overlay.model';
import { get as _get } from 'lodash';

export interface IEnumFiled {
	key: string;
	count: number;
	filteredCount: number;
	isChecked: boolean;
	disabled?: boolean;
}

export class EnumFilterMetadata extends FilterMetadata {
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

	initializeFilter(overlays: IOverlay[], modelName: string, caseFilter?: ICaseFilter<ICaseEnumFilterMetadata>, visibility?: boolean): void {
		super.initializeFilter(overlays, modelName, caseFilter, visibility);
		this.enumsFields = new Map<string, IEnumFiled>();

		overlays.forEach((overlay: any) => {
			this.accumulateData(_get(overlay, modelName));
		});

		if (caseFilter) {
			caseFilter.metadata = Array.isArray(caseFilter.metadata) ? {
				unCheckedEnums: caseFilter.metadata,
				disabledEnums: []
			} : caseFilter.metadata; // hack for old contexts:
			if (caseFilter.positive) {
				this.enumsFields.forEach((enumsField: IEnumFiled) => {
					enumsField.isChecked = caseFilter.metadata.unCheckedEnums.includes(enumsField.key);
				});
			} else {
				caseFilter.metadata.unCheckedEnums
					.map(key => this.enumsFields.get(key))
					.filter(Boolean)
					.forEach((enumsField: IEnumFiled) => {
						enumsField.isChecked = false;
					});

				caseFilter.metadata.disabledEnums
					.map(key => this.enumsFields.get(key))
					.filter(Boolean)
					.forEach((enumsField: IEnumFiled) => {
						enumsField.disabled = true;
					});
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

		return selectedFields.some((filterParams) => _get(overlay, key) === filterParams);
	}

	getMetadataForOuterState(): ICaseEnumFilterMetadata {
		const unCheckedEnums: string[] = [];
		const disabledEnums: string[] = [];

		this.enumsFields.forEach((value: IEnumFiled, key: string) => {
			if (!value.isChecked) {
				unCheckedEnums.push(key);
			}

			if (value.disabled) {
				disabledEnums.push(key);
			}
		});

		return {
			unCheckedEnums,
			disabledEnums
		};
	}

	isFiltered(): boolean {
		return mapValuesToArray(this.enumsFields).some((value: IEnumFiled) => !value.isChecked);
	}

	showAll(): void {
		this.enumsFields.forEach((value: IEnumFiled) => {
			if (!value.disabled) {
				value.isChecked = true;
			}
		});
	}

	shouldBeHidden(): boolean {
		return !this.visible;
	}
}
