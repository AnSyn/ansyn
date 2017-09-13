import { EnumFilterMetadata } from './../../models/metadata/enum-filter-metadata';
import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'ansyn-enum-filter-container',
	templateUrl: './enum-filter-container.component.html',
	styleUrls: ['./enum-filter-container.component.less']
})
export class EnumFilterContainerComponent {

	@Input() metadata: EnumFilterMetadata;
	@Output() onMetadataChange = new EventEmitter<EnumFilterMetadata>();

	constructor(private myElement: ElementRef) {
	}

	onInputClicked(key: string) {
		const clonedMetadata: EnumFilterMetadata = Object.assign(Object.create(this.metadata), this.metadata);
		clonedMetadata.updateMetadata(key);

		this.onMetadataChange.emit(clonedMetadata);
	}

	selectOnly(key: any) {
		const clonedMetadata: EnumFilterMetadata = Object.assign(Object.create(this.metadata), this.metadata);
		clonedMetadata.selectOnly(key);

		this.onMetadataChange.emit(clonedMetadata);
	}
}
