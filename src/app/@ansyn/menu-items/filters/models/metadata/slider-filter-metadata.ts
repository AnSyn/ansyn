import { FilterMetadata } from './filter-metadata.interface';
import { FilterType } from '@ansyn/core';

export class SliderFilterMetadata implements FilterMetadata {
	count = 0;
	filteredCount = 0;

	min: number = Number.MAX_SAFE_INTEGER;;
	max: number = Number.MIN_SAFE_INTEGER;;

	start = -Infinity;
	end = Infinity;

	type: FilterType = FilterType.Slider;

	updateMetadata(range: { start: number, end: number }): void {
		if (!range || (range.start && range.end && range.start > range.end)) {
			return;
		}

		this.start = range.start || -Infinity;
		this.end = range.end || Infinity;
	}

	accumulateData(value: number): void {
		if (value < this.min) {
			this.min = value;
		}

		if (value > this.max) {
			this.max = value;
		}
		this.count++;
	}

	incrementFilteredCount(value: number): void {
		this.filteredCount++;
	}

	resetFilteredCount(): void {
		this.filteredCount = 0;
	}

	initializeFilter(range: { start: number, end: number }): void {
		this.count = 0;
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

	shouldBeHidden(): boolean {
		return this.min === this.max;
	}
}
