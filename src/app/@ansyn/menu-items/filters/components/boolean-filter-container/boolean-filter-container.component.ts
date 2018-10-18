import { Component, EventEmitter, HostBinding, Inject, Input, Output } from '@angular/core';
import { BooleanFilterMetadata, IBooleanFilterModel } from '../../models/metadata/boolean-filter-metadata';
import { FilterMetadata } from '../../models/metadata/filter-metadata.interface';
import { FilterType } from '@ansyn/core';

export interface IBooleanFilterCustomData {
	displayTrueName: string;
	displayFalseName: string;
}

@Component({
	selector: 'ansyn-boolean-filter-container',
	templateUrl: './boolean-filter-container.component.html',
	styleUrls: ['./boolean-filter-container.component.less']
})
export class BooleanFilterContainerComponent {
	@Input() model: string;
	@Output() onMetadataChange = new EventEmitter<BooleanFilterMetadata>();

	get metadata(): IBooleanFilterModel {
		return this.filterMetadata
			.find((filter: FilterMetadata) => filter.type === FilterType.Boolean)
			.models[this.model];
	}

	@Input()
	set customData(value: IBooleanFilterCustomData) {
		if (value) {
			this.metadata.true.displayName = value.displayTrueName;
			this.metadata.false.displayName = value.displayFalseName;
		}
	}

	@HostBinding('hidden')
	get hidden() {
		const countAll = this.metadata.true.count + this.metadata.false.count;
		return countAll < 1;
	}

	get metadataValues() {
		return Object.values(this.metadata);
	}

	constructor(@Inject(FilterMetadata) protected filterMetadata: FilterMetadata[]) {
	}

	onInputClicked(key: string, value: boolean) {
		// this.metadata.updateMetadata({ key, value });
		// this.onMetadataChange.emit(this.metadata);
	}

	selectOnly(key: string) {
		// this.metadata.selectOnly(key);
		// this.onMetadataChange.emit(this.metadata);
	}
}
