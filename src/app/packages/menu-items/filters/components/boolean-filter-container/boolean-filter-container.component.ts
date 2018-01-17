import { Component, Input, Output, EventEmitter } from '@angular/core';
import { EnumFilterMetadata } from '../../models/metadata/enum-filter-metadata';
import { BooleanFilterMetadata } from '../../models/metadata/boolean-filter-metadata';

export interface BooleanFilterCustomData {
	displayTrueName: string;
	displayFalseName: string;
}

export type BooleanOption = 'trueProperties' | 'falseProperties';

@Component({
	selector: 'ansyn-boolean-filter-container',
	templateUrl: './boolean-filter-container.component.html',
	styleUrls: ['./boolean-filter-container.component.less']
})
export class BooleanFilterContainerComponent extends EnumFilterMetadata {
	@Input() metadata: BooleanFilterMetadata;
	@Output() onMetadataChange = new EventEmitter<BooleanFilterMetadata>();
	@Input() customData: BooleanFilterCustomData;

	booleanOptions: { [key: string]: BooleanOption } = { trueKey: 'trueProperties', falseKey: 'falseProperties' };

	onInputClicked(key: string, value: boolean) {
		this.metadata.updateMetadata({key, value});
		this.onMetadataChange.emit(this.metadata);
	}

	selectOnly(key: string) {
		this.metadata.selectOnly(key);
		this.onMetadataChange.emit(this.metadata);
	}
}
