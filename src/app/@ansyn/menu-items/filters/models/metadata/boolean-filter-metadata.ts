import { Filter } from '../filter';
import { CaseBooleanFilterMetadata } from '@ansyn/menu-items/cases/models/case.model';
import { FilterMetadata } from './filter-metadata.interface';
import { FilterType } from '@ansyn/core/models/case.model';

export interface BooleanProperties {
	value: boolean;
	count: number;
}

export class BooleanFilterMetadata implements FilterMetadata{
	type: FilterType = FilterType.Boolean;

	trueProperties: BooleanProperties = {
		value: true,
		count: 0
	};

	falseProperties: BooleanProperties = {
		value: true,
		count: 0
	};

	baseFilter: Filter;

	updateMetadata({key, value}): void {
		this[key].value = value;
	}

	resetFilterCount(): void {
		this.trueProperties.count = 0;
		this.falseProperties.count = 0;
	}

	selectOnly(key: string): void {
		this.trueProperties.value = false;
		this.falseProperties.value = false;
		this[key].value = true;
	}

	accumulateData(value: boolean): void {
		if (value) {
			this.trueProperties.count += 1;
		} else {
			this.falseProperties.count += 1;
		}
	}

	initializeFilter(selectedValues: CaseBooleanFilterMetadata, filter: Filter): void {
		this.trueProperties.count = 0;
		this.trueProperties.value = true;
		this.falseProperties.value = true;
		this.falseProperties.count = 0;

		this.baseFilter = filter;
		if (selectedValues) {
			this.falseProperties.value = selectedValues.displayFalse;
			this.trueProperties.value = selectedValues.displayTrue;
		}
	}

	postInitializeFilter(value: any): void {
	}

	filterFunc(overlay: any, key: string): boolean {
		if (this.trueProperties.value && this.falseProperties.value) {
			return true;
		}
		if (this.trueProperties.value && overlay[key]) {
			return true;
		}
		if (this.falseProperties.value && !overlay[key]) {
			return true;
		}
		return false;
	}

	getMetadataForOuterState(): { displayTrue: boolean, displayFalse: boolean } {
		const displayTrue = this.trueProperties.value;
		const displayFalse = this.falseProperties.value;
		return { displayTrue , displayFalse };
	}

	isFiltered(): boolean {
		return (!this.trueProperties.value && this.trueProperties.count > 0) || (!this.falseProperties.value && this.falseProperties.count > 0) ;
	}

	showAll(): void {
		this.trueProperties.value = true;
		this.falseProperties.value = true;
	}


}
