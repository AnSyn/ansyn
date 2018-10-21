import { FilterMetadata } from './filter-metadata.interface';
import { CaseEnumFilterMetadata, FilterType, ICaseFilter, IOverlay, mapValuesToArray } from '@ansyn/core';
import { Inject, Injectable } from '@angular/core';
import { filtersConfig } from '../../services/filters.service';
import { IFiltersConfig } from '../filters-config';
import { Store } from '@ngrx/store';
import { UpdateFilterAction } from '../../actions/filters.actions';
import { selectFilters } from '../../reducer/filters.reducer';
import { filter, map, tap } from 'rxjs/operators';
import { get } from 'lodash';

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
	caseFilters: ICaseFilter<CaseEnumFilterMetadata>[];

	constructor(@Inject(filtersConfig) protected config: IFiltersConfig, protected store: Store<any>) {
		super(FilterType.Enum, config);
		this.store.select(selectFilters).pipe(
			map((filters: ICaseFilter[]) => filters.filter(({ type }) => type === FilterType.Enum)),
			filter(Boolean),
			tap((caseFilters: ICaseFilter<CaseEnumFilterMetadata>[]) => {
				this.caseFilters = caseFilters;
				this.updateModels();
			})
		).subscribe();
	}

	initialModelObject(): IEnumFilterModel {
		return new Map<string, IEnumFiled>();
	}

	updateMetadata(model: string, key: string): void {
		const metadata = [];
		this.store.dispatch(new UpdateFilterAction({
			type: FilterType.Enum,
			fieldName: model,
			metadata: Array.from(this.models[fieldName].keys()).filter((key) => key !== selectedKey)
		}));
		// if (this.models[model].get(key)) {
		// 	this.models[model].get(key).isChecked = !this.models[model].get(key).isChecked;
		// }
		// this.updateState(model);
	}

	selectOnly(model: string, selectedKey: string): void {
		this.store.dispatch(new UpdateFilterAction({
			type: FilterType.Enum,
			fieldName: model,
			metadata: Array.from(this.models[fieldName].keys()).filter((key) => key !== selectedKey)
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

	initializeFilter(overlays: IOverlay[]): void {
		this.initializeModels(overlays);
		this.updateModels();
	}

	private initializeModels(overlays: IOverlay[]) {
		Object.keys(this.models).forEach((model: string) => {
			overlays.forEach((overlay: any) => {
				this.accumulateData(model, overlay[model]);
			});
		});
	}

	private updateModels() {
		Object.keys(this.models).forEach((model: string) => {
			this.updateFields(model);
		});
	}

	private updateFields(model: string) {
		this.models[model] = new Map<string, IEnumFiled>();
		const caseFilter = this.caseFilters.find(({ type, fieldName }: ICaseFilter) => this.type === type && model === fieldName);
		if (caseFilter) {
			this.models[model].forEach((enumsField, key) => {
				enumsField.isChecked = caseFilter.metadata.includes(key) ? false : true
			});
		}
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
			.map(this.getOneMetadataForOuterState.bind(this));
	}

	getOneMetadataForOuterState([fieldName, enumFilterModel]: [string, IEnumFilterModel]): ICaseFilter<CaseEnumFilterMetadata> {
		const metadata: string[] = [];
		enumFilterModel.forEach((value: { count: number, isChecked: boolean }, key: string) => {
			if (!value.isChecked) {
				metadata.push(key);
			}
		});
		const prevMetadata = get(this.caseFilters.find((caseFilter: ICaseFilter) => caseFilter.fieldName === fieldName), 'metadata') || [];
		prevMetadata.filter((uncheckField: string) => !enumFilterModel.has(uncheckField));
		return {
			type: this.type,
			fieldName,
			metadata: [...prevMetadata, ...metadata]
		};
	}

	isFiltered(model: string): boolean {
		return mapValuesToArray(this.models[model]).some((value: IEnumFiled) => !value.isChecked);
	}

	showAll(model: string): void {
		this.models[model].forEach((value: IEnumFiled) => {
			value.isChecked = true;
		});
	}
	shouldBeHidden(model: string): boolean {
		return false;
	}
}
