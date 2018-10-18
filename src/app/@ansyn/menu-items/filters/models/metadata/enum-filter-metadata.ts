import { FilterMetadata } from './filter-metadata.interface';
import { CaseFilters, FilterType, IOverlay, mapValuesToArray } from '@ansyn/core';
import { Inject, Injectable } from '@angular/core';
import { filtersConfig } from '../../services/filters.service';
import { IFiltersConfig } from '../filters-config';
import { CaseEnumFilterMetadata, ICaseFilter } from '@ansyn/core';

export interface IEnumFiled {
	count: number;
	filteredCount: number;
	isChecked: boolean;
	disabled?: boolean;
}

export interface IEnumFilterModel {
	enumsFields: Map<string, IEnumFiled>;
}

export interface IEnumFiled {
	count: number;
	filteredCount: number;
	isChecked: boolean;
	disabled?: boolean;
}

@Injectable()
export class EnumFilterMetadata extends FilterMetadata<IEnumFilterModel> {
	constructor(@Inject(filtersConfig) protected config: IFiltersConfig) {
		super(FilterType.Enum, config);
	}

	initialModelObject(): IEnumFilterModel {
		return { enumsFields: new Map<string, IEnumFiled>() }
	}

	updateMetadata(model: string, key: string): void {
		if (this.models[model].enumsFields.get(key)) {
			this.models[model].enumsFields.get(key).isChecked = !this.models[model].enumsFields.get(key).isChecked;
		}
	}

	selectOnly(model: string, selectedKey: string): void {
		this.models[model].enumsFields.forEach((value: IEnumFiled, key: string) => {
			value.isChecked = (key === selectedKey);
		});
	}

	accumulateData(model: string, value: string): void {
		if (!this.models[model].enumsFields.get(value)) {
			this.models[model].enumsFields.set(value, { count: 1, filteredCount: 0, isChecked: true });
		} else {
			this.models[model].enumsFields.get(value).count = this.models[model].enumsFields.get(value).count + 1;
		}
	}

	incrementFilteredCount(model: string, value: any): void {
		this.models[model].enumsFields.get(value).filteredCount = this.models[model].enumsFields.get(value).filteredCount + 1;
	}

	resetFilteredCount(model: string): void {
		this.models[model].enumsFields.forEach((val, key) => {
			val.filteredCount = 0;
		});
	}

	initializeFilter(overlays: IOverlay[], caseFilters: ICaseFilter<CaseEnumFilterMetadata>[] = []): void {
		Object.entries(this.models).forEach(([model, enumFilterModel]: [string, IEnumFilterModel]) => {
			enumFilterModel.enumsFields = new Map<string, IEnumFiled>();
			overlays.forEach((overlay: any) => {
				this.accumulateData(model, overlay[model]);
			});
			const caseFilter = caseFilters.find(({ type, fieldName }: ICaseFilter) => this.type === type && model === fieldName);
			if (caseFilter) {
				caseFilter
					.metadata
					.map(key => enumFilterModel.enumsFields.get(key))
					.filter(Boolean)
					.forEach((enumsField: IEnumFiled) => enumsField.isChecked = false);
			}
		});
	}

	filterFunc(model: string, overlay: any, key: string): boolean {
		if (!overlay) {
			return false;
		}
		const selectedFields: string[] = [];
		this.models[model].enumsFields.forEach(({ isChecked }: IEnumFiled, key: string) => {
			if (isChecked) {
				selectedFields.push(key);
			}
		});

		return selectedFields.some((filterParams) => overlay[key] === filterParams);
	}

	getMetadataForOuterState(): ICaseFilter<CaseEnumFilterMetadata>[] {
		return Object.entries(this.models).map(([fieldName, enumFilterModel]) => {
			const metadata: string[] = [];
			enumFilterModel.enumsFields.forEach((value: { count: number, isChecked: boolean }, key: string) => {
				if (!value.isChecked) {
					metadata.push(key);
				}
			});
			return {
				type: this.type,
				fieldName,
				metadata
			};
		});
	}

	isFiltered(model: string): boolean {
		return mapValuesToArray(this.models[model].enumsFields).some((value: IEnumFiled) => !value.isChecked);
	}

	showAll(model: string): void {
		this.models[model].enumsFields.forEach((value: IEnumFiled) => {
			value.isChecked = true;
		});
	}
	shouldBeHidden(model: string): boolean {
		return false;
	}
}
