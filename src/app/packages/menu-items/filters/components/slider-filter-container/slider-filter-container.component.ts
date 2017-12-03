import { SliderFilterMetadata } from './../../models/metadata/slider-filter-metadata';
import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'ansyn-slider-filter-container',
	templateUrl: './slider-filter-container.component.html',
	styleUrls: ['./slider-filter-container.component.less']
})
export class SliderFilterContainerComponent {

	factor = 1000;
	_metadata: SliderFilterMetadata;
	realRange: number[];

	@Input()
	set metadata(value: SliderFilterMetadata) {
		this._metadata = value;

		this.realRange = [this.factor * value.start, this.factor * value.end];

		if (value.start <= value.min) {
			value.start = value.min;
		}
		if (value.end >= value.max) {
			value.end = value.max;
		}
		this.rangeValues = [this.factor * value.start, this.factor * value.end];
	}

	get metadata(): SliderFilterMetadata {
		return this._metadata;
	}

	@Output() onMetadataChange = new EventEmitter<SliderFilterMetadata>();
	rangeValues: number[];

	constructor(protected elem: ElementRef) {
	}

	handleChange(event) {
		const updateValue = {
			start: this.realRange[0] / this.factor,
			end: this.realRange[1] / this.factor
		};

		if (true) { // #TODO if left handler changed
			const min = event.values[0] / this.factor;
			updateValue.start = min === this._metadata.min ? -Infinity : min;
		}

		if (true) { // #TODO if right handler changed
			const max = event.values[1] / this.factor;
			updateValue.end = max === this._metadata.max ? Infinity : max;
		}

		const clonedMetadata: SliderFilterMetadata = Object.assign(Object.create(this.metadata), this.metadata);
		clonedMetadata.updateMetadata(updateValue);

		this.onMetadataChange.emit(clonedMetadata);
	}
}
