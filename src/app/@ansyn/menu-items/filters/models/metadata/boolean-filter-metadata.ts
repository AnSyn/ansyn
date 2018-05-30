import { Filter } from '../filter';
import { CaseBooleanFilterMetadata } from '@ansyn/menu-items/cases/models/case.model';
import { FilterMetadata } from './filter-metadata.interface';
import { FilterType } from '@ansyn/core/models/case.model';

export interface BooleanProperty {
	name: 'true' | 'false';
	displayName: string;
	value: boolean;
	filteredCount: number;
	count: number;
	disabled?: boolean;
}
export interface BooleanProperties {
	true: BooleanProperty;
	false: BooleanProperty;
}

export class BooleanFilterMetadata implements FilterMetadata {
	type: FilterType = FilterType.Boolean;
	properties: BooleanProperties = {
		true: {
			name: 'true',
			displayName: 'true',
			value: true,
			filteredCount: 0,
			count: 0,
			disabled: false
		},
		false: {
			name: 'false',
			displayName: 'false',
			value: true,
			filteredCount: 0,
			count: 0,
			disabled: false
		}
	};

	baseFilter: Filter;

	updateMetadata({ key, value }): void {
		this.properties[key].value = value;
	}

	resetFilteredCount(): void {
		this.properties.true.filteredCount = 0;
		this.properties.false.filteredCount = 0;
	}

	selectOnly(key: string): void {
		this.properties.true.value = false;
		this.properties.false.value = false;
		this.properties[key].value = true;
	}

	accumulateData(value: boolean): void {
		if (value) {
			this.properties.true.count += 1;
		} else {
			this.properties.false.count += 1;
		}
	}

	incrementFilteredCount(value: boolean): void {
		if (value) {
			this.properties.true.filteredCount += 1;
		} else {
			this.properties.false.filteredCount += 1;
		}
	}

	initializeFilter(selectedValues: CaseBooleanFilterMetadata, filter: Filter): void {
		this.properties.true.count = 0;
		this.properties.true.value = true;
		this.properties.false.value = true;
		this.properties.false.count = 0;

		this.baseFilter = filter;
		if (selectedValues) {
			this.properties.false.value = selectedValues.displayFalse;
			this.properties.true.value = selectedValues.displayTrue;
		}
	}

	postInitializeFilter(value: any): void {
	}

	filterFunc(overlay: any, key: string): boolean {
		if (this.properties.true.value && this.properties.false.value) {
			return true;
		}
		if (this.properties.true.value && overlay[key]) {
			return true;
		}
		if (this.properties.false.value && !overlay[key]) {
			return true;
		}
		return false;
	}

	getMetadataForOuterState(): { displayTrue: boolean, displayFalse: boolean } {
		const displayTrue = this.properties.true.value;
		const displayFalse = this.properties.false.value;
		return { displayTrue, displayFalse };
	}

	isFiltered(): boolean {
		return (!this.properties.true.value && this.properties.true.count > 0) || (!this.properties.false.value && this.properties.false.count > 0);
	}

	showAll(): void {
		this.properties.true.value = true;
		this.properties.false.value = true;
	}


}
