import { FilterMetadata } from './filter-metadata.interface';
import {
	CaseEnumFilterMetadata,
	FilterType,
	ICaseBooleanFilterMetadata,
	ICaseFilter,
	ICaseSliderFilterMetadata,
	IOverlay
} from '@ansyn/core';
import { Inject } from '@angular/core';
import { filtersConfig } from '../../services/filters.service';
import { IFiltersConfig } from '../filters-config';
import { ISliderFilterModel } from './slider-filter-metadata';

export interface IBooleanProperty {
	name: 'true' | 'false';
	displayName: string;
	value: boolean;
	filteredCount: number;
	count: number;
	disabled?: boolean;
}

export interface IBooleanFilterModel {
	true: IBooleanProperty;
	false: IBooleanProperty;
}

export class BooleanFilterMetadata extends FilterMetadata<IBooleanFilterModel> {
	constructor(@Inject(filtersConfig) protected config: IFiltersConfig) {
		super(FilterType.Boolean, config);
	}

	initialModelObject(): IBooleanFilterModel {
		return {
			'true': {
				name: 'true',
				displayName: 'true',
				value: true,
				filteredCount: 0,
				count: 0,
				disabled: false
			},
			'false': {
				name: 'false',
				displayName: 'false',
				value: true,
				filteredCount: 0,
				count: 0,
				disabled: false
			}
		};
	}

	updateMetadata(model: string, { key, value }): void {
		this.models[model][key].value = value;
	}

	resetFilteredCount(model: string): void {
		this.models[model].true.filteredCount = 0;
		this.models[model].false.filteredCount = 0;
	}

	selectOnly(model: string, key: string): void {
		this.models[model].true.value = false;
		this.models[model].false.value = false;
		this.models[model][key].value = true;
	}

	accumulateData(model: string, value: boolean): void {
		if (value) {
			this.models[model].true.count += 1;
		} else {
			this.models[model].false.count += 1;
		}
	}

	incrementFilteredCount(model: string, value: boolean): void {
		if (value) {
			this.models[model].true.filteredCount += 1;
		} else {
			this.models[model].false.filteredCount += 1;
		}
	}

	initializeFilter(overlays: IOverlay[], caseFilters: ICaseFilter<ICaseBooleanFilterMetadata>[] = []): void {
		Object.entries(this.models).forEach(([model, booleanFilterModel]: [string, IBooleanFilterModel]) => {
			booleanFilterModel.true.count = 0;
			booleanFilterModel.true.value = true;
			booleanFilterModel.false.value = true;
			booleanFilterModel.false.count = 0;

			overlays.forEach((overlay: any) => {
				this.accumulateData(model, overlay[model]);
			});
			const caseFilter = caseFilters.find(({ type, fieldName }: ICaseFilter) => this.type === type && model === fieldName);
			if (caseFilter) {
				this.models[model].false.value = caseFilter.metadata.displayFalse;
				this.models[model].true.value = caseFilter.metadata.displayTrue;
			}
		});

	}

	filterFunc(model: string, overlay: any, key: string): boolean {
		if (this.models[model].true.value && this.models[model].false.value) {
			return true;
		}
		if (this.models[model].true.value && overlay[key]) {
			return true;
		}
		if (this.models[model].false.value && !overlay[key]) {
			return true;
		}
		return false;
	}

	getMetadataForOuterState(): ICaseFilter<ICaseBooleanFilterMetadata>[] {
		return Object.entries(this.models).map(([fieldName, booleanFilterModel]) => {
			const metadata = {
				displayTrue: booleanFilterModel.true.value,
				displayFalse: booleanFilterModel.false.value
			};
			return {
				type: this.type,
				fieldName,
				metadata
			};
		});
	}

	isFiltered(model: string): boolean {
		return (!this.models[model].true.value && this.models[model].true.count > 0) || (!this.models[model].false.value && this.models[model].false.count > 0);
	}

	showAll(model: string): void {
		this.models[model].true.value = true;
		this.models[model].false.value = true;
	}

	shouldBeHidden(model: string): boolean {
		return false;
	}

}
