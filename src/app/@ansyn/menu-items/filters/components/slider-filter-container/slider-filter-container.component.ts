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
		const rangeValuesStart = value.start <= value.min ? value.min : value.start;
		const rangeValuesEnd = value.end >= value.max ? value.max : value.end;
		this.realRange = [value.start, value.end];
		this.rangeValues = [this.factor * rangeValuesStart, this.factor * rangeValuesEnd];
	}

	get metadata(): SliderFilterMetadata {
		return this._metadata;
	}

	@Output() onMetadataChange = new EventEmitter<SliderFilterMetadata>();
	rangeValues: number[];

	constructor(protected elem: ElementRef) {
	}

	getMinRangeValue(number: number): string {
		if (number === -Infinity) {
			return 'Min';
		} else {
			return number.toString();
		}
	}

	getMaxRangeValue(number: number): string {
		if (number === Infinity) {
			return 'Max';
		} else {
			return number.toString();
		}
	}

	handleChange(event) {
		const updateValue = {
			start: this.realRange[0],
			end: this.realRange[1]
		};

		const min = event.values[0] / this.factor;
		updateValue.start = min === this._metadata.min ? -Infinity : min;
		const max = event.values[1] / this.factor;
		updateValue.end = max === this._metadata.max ? Infinity : max;

		const clonedMetadata: SliderFilterMetadata = Object.assign(Object.create(this.metadata), this.metadata);
		clonedMetadata.updateMetadata(updateValue);

		this.onMetadataChange.emit(clonedMetadata);
	}
}
