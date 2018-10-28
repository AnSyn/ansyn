import { Component, HostBinding, Inject, Input, OnInit } from '@angular/core';
import { BooleanFilterMetadata, IBooleanFilterModel } from '../../models/metadata/boolean-filter-metadata';
import { FILTERS_PROVIDERS, IFiltersProviders } from '../../models/metadata/filters-manager';

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

	get modelObject(): IBooleanFilterModel {
		return this.metadata.models[this.model];
	}

	@Input() customData: IBooleanFilterCustomData;
	@HostBinding('hidden') hidden: boolean;

	get metadataValues() {
		return Object.values(this.modelObject);
	}

	constructor(protected metadata: BooleanFilterMetadata) {
	}

	ngOnInit() {
		if (this.customData) {
			this.modelObject.true.displayName = this.customData.displayTrueName;
			this.modelObject.false.displayName = this.customData.displayFalseName;
		}

		const countAll = this.modelObject.true.count + this.modelObject.false.count;
		this.hidden = countAll < 1;

	}

	onInputClicked(key: string, value: boolean) {
		this.metadata.updateMetadata(this.model, { key, value });
	}

	selectOnly(key: string) {
		this.metadata.selectOnly(this.model, key);
	}
}
