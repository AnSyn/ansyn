import { EnumLayerMetadata } from '../../models/metadata/enum-layer-metadata';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'ansyn-enum-layer-container',
	templateUrl: './enum-layer-container.component.html',
	styleUrls: ['./enum-layer-container.component.less']
})
export class EnumLayerContainerComponent {

	@Input() metadata: EnumLayerMetadata;
	@Output() onMetadataChange = new EventEmitter<EnumLayerMetadata>();

	onInputClicked(key: string) {
		const clonedMetadata: EnumLayerMetadata = Object.assign(Object.create(this.metadata), this.metadata);
		clonedMetadata.updateMetadata(key);

		this.onMetadataChange.emit(clonedMetadata);
	}

	selectOnly(key: any) {
		const clonedMetadata: EnumLayerMetadata = Object.assign(Object.create(this.metadata), this.metadata);
		clonedMetadata.selectOnly(key);

		this.onMetadataChange.emit(clonedMetadata);
	}
}
