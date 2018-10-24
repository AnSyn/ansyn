import { FilterMetadata } from './filter-metadata.interface';
import { CaseEnumFilterMetadata, FilterType, ICaseFilter, mapValuesToArray } from '@ansyn/core';
import { Inject, Injectable } from '@angular/core';
import { filtersConfig } from '../../services/filters.service';
import { IFiltersConfig } from '../filters-config';
import { Store } from '@ngrx/store';
import { UpdateFilterAction } from '../../actions/filters.actions';
import { IEnumFiled } from '../../../public_api';
import { uniq } from 'lodash';

export interface IEnumFiled {
	count: number;
	filteredCount: number;
	isChecked: boolean;
	disabled?: boolean;
}

export type IEnumFilterModel = Map<string, IEnumFiled>;

export interface IEnumFiled {
	count: number;
	filteredCount: number;
	isChecked: boolean;
	disabled?: boolean;
}

@Injectable()
export class EnumFilterMetadata extends FilterMetadata<IEnumFilterModel> {
	constructor(@Inject(filtersConfig) protected config: IFiltersConfig, protected store$: Store<any>) {
		super(FilterType.Enum, config, store$);
	}

	initialModelObject(): IEnumFilterModel {
		return new Map<string, IEnumFiled>();
	}

	updateMetadata(model: string, key: string): void {
		const metadata = Array.from(this.models[model])
			.filter(([key, value]) => !value.isChecked)
			.map(([key]) => key);

		this.store$.dispatch(new UpdateFilterAction({
			type: FilterType.Enum,
			fieldName: model,
			metadata: metadata.includes(key) ? metadata.filter((metaKey) => metaKey !== key) : uniq([...metadata, key])
		}));
	}

	updateFilter(caseFilter: ICaseFilter<CaseEnumFilterMetadata>): void {
		const enumFields = this.models[caseFilter.fieldName];
		caseFilter.metadata.forEach((unCheckedKey) => {
			if (enumFields.has(unCheckedKey)) {
				enumFields.get(unCheckedKey).isChecked = false;
			} else {
				enumFields.set(unCheckedKey, { isChecked: false, count: 0, filteredCount: 0 });
			}
		});
	}


	selectOnly(model: string, selectedKey: string): void {
		this.store$.dispatch(new UpdateFilterAction({
			type: FilterType.Enum,
			fieldName: model,
			metadata: Array.from(this.models[model])
				.filter(([key, value]) => key !== selectedKey || (value.count === 0 && !value.isChecked))
				.map(([key]) => key)
		}));
	}

	accumulateData(model: string, value: string): void {
		if (!this.models[model].get(value)) {
			this.models[model].set(value, { count: 1, filteredCount: 0, isChecked: true });
		} else {
			this.models[model].get(value).count = this.models[model].get(value).count + 1;
		}
	}

	incrementFilteredCount(model: string, value: any): void {
		this.models[model].get(value).filteredCount = this.models[model].get(value).filteredCount + 1;
	}

	resetFilteredCount(model: string): void {
		this.models[model].forEach((val, key) => {
			val.filteredCount = 0;
		});
	}

	filterFunc(overlay: any, key: string): boolean {
		if (!overlay) {
			return false;
		}
		const selectedFields: string[] = [];
		this.models[key].forEach(({ isChecked }: IEnumFiled, key: string) => {
			if (isChecked) {
				selectedFields.push(key);
			}
		});

		return selectedFields.some((filterParams) => overlay[key] === filterParams);
	}

	getMetadataForOuterState(): ICaseFilter<CaseEnumFilterMetadata>[] {
		return Object.entries(this.models)
			.map(this.modelMetadataForOuterState.bind(this));
	}

	modelMetadataForOuterState([model, enumFilterModel]: [string, IEnumFilterModel]): ICaseFilter<CaseEnumFilterMetadata> {
		return ({
			type: this.type,
			fieldName: model,
			metadata: Array.from(enumFilterModel.entries()).filter(([key, value]) => !value.isChecked).map(([key]) => key)
		});
	}

	isFiltered(model: string): boolean {
		return mapValuesToArray(this.models[model]).some((value: IEnumFiled) => !value.isChecked);
	}

	showAll(model: string): void {
		this.store$.dispatch(new UpdateFilterAction({
			type: FilterType.Enum,
			fieldName: model,
			metadata: Array.from(this.models[model])
				.filter(([key, value]) => (value.count === 0 && !value.isChecked))
				.map(([key]) => key)
		}));
	}

	shouldBeHidden(model: string): boolean {
		return false;
	}
}
