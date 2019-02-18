import { EnumFilterMetadata } from '../../models/metadata/enum-filter-metadata';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'ansyn-enum-filter-container',
	templateUrl: './enum-filter-container.component.html',
	styleUrls: ['./enum-filter-container.component.less']
})
export class EnumFilterContainerComponent {
	@Input() metadata: EnumFilterMetadata;
	@Input() isLongFiltersList: boolean;
	@Output() onMetadataChange = new EventEmitter<EnumFilterMetadata>();

	onInputClicked(key: string) {
		this.metadata.updateMetadata(key);
		this.onMetadataChange.emit(this.metadata);
	}

	selectOnly(key: any) {
		this.metadata.selectOnly(key);
		this.onMetadataChange.emit(this.metadata);
	}
}
