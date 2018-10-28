import { EnumFilterMetadata, IEnumFiled, IEnumFilterModel } from '../../models/metadata/enum-filter-metadata';
import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FilterMetadata } from '../../models/metadata/filter-metadata.interface';
import { FilterType } from '@ansyn/core';
import { FILTERS_PROVIDERS, IFiltersProviders } from '../../models/metadata/filters-manager';
import { IBooleanFilterModel } from '../../models/metadata/boolean-filter-metadata';

@Component({
	selector: 'ansyn-enum-filter-container',
	templateUrl: './enum-filter-container.component.html',
	styleUrls: ['./enum-filter-container.component.less']
})
export class EnumFilterContainerComponent implements OnInit {
	@Input() model: string;
	@Input() isLongFiltersList: boolean;
	enumsFields = new Map<string, IEnumFiled>();

	constructor(protected metadata: EnumFilterMetadata) {
	}

	ngOnInit() {
		this.enumsFields = this.metadata.models[this.model];
	}

	onInputClicked(key: string) {
		this.metadata.updateMetadata(this.model, key);
	}

	selectOnly(key: any) {
		this.metadata.selectOnly(this.model, key);
	}
}
