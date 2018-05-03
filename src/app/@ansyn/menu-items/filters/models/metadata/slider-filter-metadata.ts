import { FilterMetadata } from './filter-metadata.interface';
import { FilterType } from '@ansyn/core/models/case.model';

export class SliderFilterMetadata implements FilterMetadata {

	min: number;
	max: number;

	start: number;
	end: number;

	type: FilterType;

	constructor() {
		this.type = FilterType.Slider;

		this.min = Number.MAX_SAFE_INTEGER;
		this.max = Number.MIN_SAFE_INTEGER;

		this.start = -Infinity;
		this.end = Infinity;
	}

	updateMetadata(range: { start: number, end: number }): void {
		if (!range || range.start > range.end) {
			return;
		}

		this.start = range.start;
		this.end = range.end;
	}

	accumulateData(value: number): void {
		if (value < this.min) {
			this.min = value;
		}

		if (value > this.max) {
			this.max = value;
		}
	}

	initializeFilter(range: { start: number, end: number }): void {
		this.updateMetadata(range);
	}

	postInitializeFilter(value: any): void {
	}

	filterFunc(overlay: any, key: string): boolean {
		return overlay[key] >= this.start &&
			overlay[key] <= this.end;
	}

	getMetadataForOuterState(): { start: number, end: number } {
		if (this.start === -Infinity && this.end === Infinity) {
			return null;
		}
		return { start: this.start, end: this.end };
	}

	isFiltered(): boolean {
		return this.start > this.min || this.end < this.max;
	}

	showAll(): void {
		this.start = -Infinity;
		this.end = Infinity;
	}
}
