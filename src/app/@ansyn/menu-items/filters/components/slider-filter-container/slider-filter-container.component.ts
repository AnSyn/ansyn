import { SliderFilterMetadata } from './../../models/metadata/slider-filter-metadata';
import { Component, ElementRef, Inject, Input, OnInit } from '@angular/core';
import { FilterMetadata } from '../../models/metadata/filter-metadata.interface';
import { FilterType } from '@ansyn/core';
import { ISliderFilterModel } from '../../models/metadata/slider-filter-metadata';

@Component({
	selector: 'ansyn-slider-filter-container',
	templateUrl: './slider-filter-container.component.html',
	styleUrls: ['./slider-filter-container.component.less']
})
export class SliderFilterContainerComponent implements OnInit {
	@Input() model: string;
	factor = 1000;
	realRange: number[] = [];
	rangeValues: number[] = [];

	get modelObject(): ISliderFilterModel {
		return this.metadata.models[this.model];
	}

	constructor(protected metadata: SliderFilterMetadata) {
	}

	ngOnInit() {
		const rangeValuesStart = this.modelObject.start <= this.modelObject.min ? this.modelObject.min : this.modelObject.start;
		const rangeValuesEnd = this.modelObject.end >= this.modelObject.max ? this.modelObject.max : this.modelObject.end;
		this.realRange = [this.modelObject.start, this.modelObject.end];
		this.rangeValues = [this.factor * rangeValuesStart, this.factor * rangeValuesEnd];
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
		updateValue.start = min === this.modelObject.min ? -Infinity : min;
		const max = event.values[1] / this.factor;
		updateValue.end = max === this.modelObject.max ? Infinity : max;
		this.metadata.updateMetadata(this.model, updateValue);
	}
}
