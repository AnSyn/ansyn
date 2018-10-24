import { SliderFilterMetadata } from './../../models/metadata/slider-filter-metadata';
import { Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FilterMetadata } from '../../models/metadata/filter-metadata.interface';
import { FilterType } from '@ansyn/core';
import { ISliderFilterModel } from '../../models/metadata/slider-filter-metadata';
import { EnumFilterMetadata, IEnumFilterModel } from '../../models/metadata/enum-filter-metadata';

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

	get metadata(): SliderFilterMetadata {
		return <any> this.filterMetadata.find(({ type }: FilterMetadata): any => type === FilterType.Slider);
	}

	constructor(protected elem: ElementRef, @Inject(FilterMetadata) protected filterMetadata: FilterMetadata[]) {
	}

	ngOnInit() {
		this.realRange = [this.metadata[this.model].start, this.metadata[this.model].end];
		this.rangeValues = [
			this.factor * this.metadata[this.model].start <= this.metadata[this.model].min ? this.metadata[this.model].min : this.metadata[this.model].start,
			this.factor * this.metadata[this.model].end >= this.metadata[this.model].max ? this.metadata[this.model].max : this.metadata[this.model].end
		];
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
		updateValue.start = min === this.metadata[this.model].min ? -Infinity : min;
		const max = event.values[1] / this.factor;
		updateValue.end = max === this.metadata[this.model].max ? Infinity : max;
		this.metadata.updateMetadata(this.model, updateValue);
	}
}
