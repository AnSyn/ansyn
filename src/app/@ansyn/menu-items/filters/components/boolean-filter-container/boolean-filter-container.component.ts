import { Component, HostBinding, Inject, Input, OnInit } from '@angular/core';
import { BooleanFilterMetadata } from '../../models/metadata/boolean-filter-metadata';
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
export class BooleanFilterContainerComponent implements OnInit {
	@Input() model: string;

	get metadata(): BooleanFilterMetadata {
		return <any> this.filterMetadata.find(({ type }: FilterMetadata): any => type === FilterType.Boolean);
	}

	@Input() customData: IBooleanFilterCustomData;
	@HostBinding('hidden') hidden: boolean;

	get metadataValues() {
		return Object.values(this.metadata);
	}

	constructor(@Inject(FilterMetadata) protected filterMetadata: FilterMetadata[]) {
	}

	ngOnInit() {
		if (this.customData) {
			this.metadata[this.model].true.displayName = this.customData.displayTrueName;
			this.metadata[this.model].false.displayName = this.customData.displayFalseName;
		}

		const countAll = this.metadata[this.model].true.count + this.metadata[this.model].false.count;
		this.hidden = countAll < 1;

	}

	onInputClicked(key: string, value: boolean) {
		this.metadata.updateMetadata(this.model, { key, value });
	}

	selectOnly(key: string) {
		this.metadata.selectOnly(this.model, key);
	}
}
