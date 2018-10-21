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
				this.updateFieldsViaCase();
			})
		).subscribe();
	}

	initialModelObject(): IEnumFilterModel {
		return new Map<string, IEnumFiled>();
	}

	updateMetadata(model: string, key: string): void {
		const metadata = Array.from(this.models[model].entries()).filter(([key, value]) => !value.isChecked).map(([key]) => key);
		this.store.dispatch(new UpdateFilterAction(this.concatPrev({
			type: FilterType.Enum,
			fieldName: model,
			metadata: metadata.includes(key) ? metadata.filter((metaKey) => metaKey !== key) : [...metadata, key]
		})));
	}

	updateFieldsViaCase(): void {
		Object.entries(this.models).forEach(([model, value]: [string, IEnumFilterModel]) => {
			const prevMetadata = this.caseFilters.find(({ fieldName }) => fieldName === model);
			if (prevMetadata) {
				value.forEach((value: IEnumFiled, key: string) => {
					value.isChecked = prevMetadata.metadata.includes(key) ? false : true
				});
			}
		})
	}

	concatPrev(payload: ICaseFilter<CaseEnumFilterMetadata>): ICaseFilter<CaseEnumFilterMetadata> {
		const prevMetadata = get(this.caseFilters.find(({ fieldName }) => fieldName === payload.fieldName), 'metadata') || [];
		return {
			...payload,
			metadata: payload.metadata.concat(prevMetadata.filter((key) => !this.models[payload.fieldName].has(key)))
		}
	}

	selectOnly(model: string, selectedKey: string): void {
		this.store.dispatch(new UpdateFilterAction(this.concatPrev({
			type: FilterType.Enum,
			fieldName: model,
			metadata: Array.from(this.models[model].keys()).filter((key) => key !== selectedKey)
		})));
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
		Object.keys(this.models).forEach((model: string) => {
			overlays.forEach((overlay: any) => {
				this.accumulateData(model, overlay[model]);
			});
		});
		this.updateFieldsViaCase();
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

	modelMetadataForOuterState([fieldName, enumFilterModel]: [string, IEnumFilterModel]): ICaseFilter<CaseEnumFilterMetadata> {
		const metadata: string[] = Array.from(enumFilterModel.entries()).filter(([key, value]) => !value.isChecked).map(([key]) => key);
		return this.concatPrev({
			type: this.type,
			fieldName,
			metadata
		});
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
