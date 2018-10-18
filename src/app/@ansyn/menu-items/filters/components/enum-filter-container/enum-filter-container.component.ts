import { EnumFilterMetadata, IEnumFilterModel } from '../../models/metadata/enum-filter-metadata';
import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FilterMetadata } from '../../models/metadata/filter-metadata.interface';
import { FilterType } from '@ansyn/core';

@Component({
	selector: 'ansyn-enum-filter-container',
	templateUrl: './enum-filter-container.component.html',
	styleUrls: ['./enum-filter-container.component.less']
})
export class EnumFilterContainerComponent {
	protected _model: string;
	protected metadata: IEnumFilterModel;

	@Input()
	set model(value: string) {
		this._model = value;
		this.metadata = this.filterMetadata
			.find((filter: FilterMetadata) => filter.type === FilterType.Enum)
			.models[this.model];
	};

	get model() {
		return this._model;
	}

	@Input() isLongFiltersList: boolean;
	@Output() onMetadataChange = new EventEmitter<EnumFilterMetadata>();

	constructor(@Inject(FilterMetadata) protected filterMetadata: FilterMetadata[]) {
	}

	onInputClicked(key: string) {
		// const clonedMetadata: EnumFilterMetadata = Object.assign(Object.create(this.metadata), this.metadata);
		// clonedMetadata.updateMetadata(key);
		//
		// this.onMetadataChange.emit(clonedMetadata);
	}

	selectOnly(key: any) {
		const clonedMetadata: EnumFilterMetadata = Object.assign(Object.create(this.metadata), this.metadata);
		clonedMetadata.selectOnly(this.model, key);

		// this.onMetadataChange.emit(clonedMetadata);
	}
}
