import { FilterMetadata } from './filter-metadata.interface';
import { FilterType, ICaseBooleanFilterMetadata, ICaseFilter } from '@ansyn/core';
import { Inject, Injectable } from '@angular/core';
import { filtersConfig, IFiltersConfig } from '../filters-config';
import { UpdateFilterAction } from '../../actions/filters.actions';
import { Store } from '@ngrx/store';

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

@Injectable({
	providedIn: 'root'
})
export class BooleanFilterMetadata extends FilterMetadata<IBooleanFilterModel> {
	constructor(@Inject(filtersConfig) protected config: IFiltersConfig, protected stroe$: Store<any>) {
		super(FilterType.Boolean, config, stroe$);
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
		this.store$.dispatch(new UpdateFilterAction({
			type: FilterType.Boolean,
			fieldName: model,
			metadata: {
				displayTrue: this.models[model].false.value,
				displayFalse: this.models[model].false.value,
				[key === 'true' ? 'displayTrue' : 'displayFalse']: value
			}
		}));
	}

	updateFilter(caseFilter: ICaseFilter<ICaseBooleanFilterMetadata>) {
		const modelObject = this.models[caseFilter.fieldName];
		modelObject.true.value = caseFilter.metadata.displayTrue;
		modelObject.false.value = caseFilter.metadata.displayFalse;
	}

	resetFilteredCount(model: string): void {
		this.models[model].true.filteredCount = 0;
		this.models[model].false.filteredCount = 0;
	}

	selectOnly(model: string, key: string): void {
		this.store$.dispatch(new UpdateFilterAction({
			type: FilterType.Boolean,
			fieldName: model,
			metadata: {
				displayTrue: false,
				displayFalse: false,
				[key === 'true' ? 'displayTrue' : 'displayFalse']: true
			}
		}));
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

	filterFunc(overlay: any, key: string): boolean {
		if (this.models[key].true.value && this.models[key].false.value) {
			return true;
		}
		if (this.models[key].true.value && overlay[key]) {
			return true;
		}
		if (this.models[key].false.value && !overlay[key]) {
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
		this.store$.dispatch(new UpdateFilterAction({
			type: FilterType.Boolean,
			fieldName: model,
			metadata: {
				displayTrue: true,
				displayFalse: true
			}
		}));
	}

	shouldBeHidden(model: string): boolean {
		return false;
	}

}
