import { Component, EventEmitter, Input, Output, HostBinding } from '@angular/core';
import { BooleanFilterMetadata } from '../../models/metadata/boolean-filter-metadata';

export interface BooleanFilterCustomData {
	displayTrueName: string;
	displayFalseName: string;
}

@Component({
	selector: 'ansyn-boolean-filter-container',
	templateUrl: './boolean-filter-container.component.html',
	styleUrls: ['./boolean-filter-container.component.less']
})
export class BooleanFilterContainerComponent {
	@Input() metadata: BooleanFilterMetadata;
	@Output() onMetadataChange = new EventEmitter<BooleanFilterMetadata>();
	@Input()
	set customData(value: BooleanFilterCustomData ) {
		if (value) {
			this.metadata.properties.true.displayName = value.displayTrueName;
			this.metadata.properties.false.displayName = value.displayFalseName;
		}
	}

	@HostBinding('hidden')
	get hidden() {
		const countAll = this.metadata.properties.true.count + this.metadata.properties.false.count;
		return  countAll < 1;
	}

	get metadataValues() {
		return Object.values(this.metadata.properties)
	}

	onInputClicked(key: string, value: boolean) {
		this.metadata.updateMetadata({ key, value });
		this.onMetadataChange.emit(this.metadata);
	}

	selectOnly(key: string) {
		this.metadata.selectOnly(key);
		this.onMetadataChange.emit(this.metadata);
	}
}
