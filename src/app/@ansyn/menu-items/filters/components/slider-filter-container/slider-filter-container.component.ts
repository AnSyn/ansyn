import { SliderFilterMetadata } from './../../models/metadata/slider-filter-metadata';
import { Component, ElementRef, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FilterMetadata } from '../../models/metadata/filter-metadata.interface';
import { FilterType } from '@ansyn/core';
import { ISliderFilterModel } from '../../models/metadata/slider-filter-metadata';
import { IEnumFilterModel } from '../../models/metadata/enum-filter-metadata';

@Component({
	selector: 'ansyn-slider-filter-container',
	templateUrl: './slider-filter-container.component.html',
	styleUrls: ['./slider-filter-container.component.less']
})
export class SliderFilterContainerComponent {
	protected _model: string;
	protected metadata: ISliderFilterModel;
	factor = 1000;
	realRange: number[];
	rangeValues: number[];

	@Input()
	set model(value: string) {
		this._model = value;
		this.metadata = this.filterMetadata
			.find((filter: FilterMetadata) => filter.type === FilterType.Slider)
			.models[this.model];
		this.realRange = [this.metadata.start, this.metadata.end];
		this.rangeValues = [
			this.factor * this.metadata.start <= this.metadata.min ? this.metadata.min : this.metadata.start,
			this.factor * this.metadata.end >= this.metadata.max ? this.metadata.max : this.metadata.end
		];
	};

	get model() {
		return this._model;
	}


	@Output() onMetadataChange = new EventEmitter<SliderFilterMetadata>();


	constructor(protected elem: ElementRef, @Inject(FilterMetadata) protected filterMetadata: FilterMetadata[]) {
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
		updateValue.start = min === this.metadata.min ? -Infinity : min;
		const max = event.values[1] / this.factor;
		updateValue.end = max === this.metadata.max ? Infinity : max;

		const clonedMetadata: SliderFilterMetadata = Object.assign(Object.create(this.metadata), this.metadata);
		// clonedMetadata.updateMetadata(updateValue);

		// this.onMetadataChange.emit(clonedMetadata);
	}
}
