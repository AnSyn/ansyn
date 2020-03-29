import { FilterMetadata } from './filter-metadata.interface';
import { FilterType } from '../filter-type';
import { ICaseBooleanFilterMetadata, ICaseFilter } from '../../../cases/models/case.model';
import { IOverlay } from '../../../../overlays/models/overlay.model';
import { Injectable } from "@angular/core";

export interface IBooleanProperty {
	name: 'true' | 'false';
	displayName: string;
	value: boolean;
	filteredCount: number;
	count: number;
	disabled?: boolean;
}

export interface IBooleanProperties {
	true: IBooleanProperty;
	false: IBooleanProperty;
}

@Injectable()
export class BooleanFilterMetadata extends FilterMetadata {
	type: FilterType = FilterType.Boolean;
	properties: IBooleanProperties = {
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

	initializeFilter(overlays: IOverlay[], modelName: string, caseFilter: ICaseFilter<ICaseBooleanFilterMetadata>, visibility?: boolean): void {
		super.initializeFilter(overlays, modelName, caseFilter, visibility);
		this.properties.true.count = 0;
		this.properties.true.value = true;
		this.properties.false.value = true;
		this.properties.false.count = 0;

		overlays.forEach((overlay: any) => {
			this.accumulateData(overlay[modelName]);
		});
		if (caseFilter) {
			this.properties.false.value = caseFilter.metadata.displayFalse;
			this.properties.false.disabled = caseFilter.metadata.isDisplayFalseDisabled;
			this.properties.true.value = caseFilter.metadata.displayTrue;
			this.properties.true.disabled = caseFilter.metadata.isDisplayTrueDisabled;
		}
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

	getMetadataForOuterState(): ICaseBooleanFilterMetadata {
		const displayTrue = this.properties.true.value;
		const displayFalse = this.properties.false.value;
		return {
			displayTrue,
			isDisplayTrueDisabled: this.properties.true.disabled,
			displayFalse,
			isDisplayFalseDisabled: this.properties.false.disabled
		};
	}

	isFiltered(): boolean {
		return (!this.properties.true.value && this.properties.true.count > 0) || (!this.properties.false.value && this.properties.false.count > 0);
	}

	showAll(): void {
		if (!this.properties.true.disabled) {
			this.properties.true.value = true;
		}
		if (!this.properties.false.disabled) {
			this.properties.false.value = true;
		}
	}

	shouldBeHidden(): boolean {
		return !this.visible;
	}

}
