import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ArrayFilterMetadata } from '../../models/metadata/array-filter-metadata';

@Component({
	selector: 'ansyn-array-filter-container',
	templateUrl: './array-filter-container.component.html',
	styleUrls: ['./array-filter-container.component.less']
})
export class ArrayFilterContainerComponent {
	_metadata: ArrayFilterMetadata;
	fields = [];

	@Input()
	set metadata(value: ArrayFilterMetadata) {
		this._metadata = value;
		this.fields = Array.from(this._metadata.fields);
	};

	get metadata() {
		return this._metadata;
	}

	@Output() onMetadataChange = new EventEmitter<ArrayFilterMetadata>();

	onInputClicked(key: string) {
		this.metadata.updateMetadata(key);
		this.onMetadataChange.emit(this.metadata);
	}

}
