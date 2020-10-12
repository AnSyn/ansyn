import { Injectable } from '@angular/core';
import { FilterCounters } from './filter-counters.interface';
import { FilterType } from '../filter-type';
import { SliderFilterMetadata } from '../metadata/slider-filter-metadata';

@Injectable()
export class SliderFilterCounters extends FilterCounters {
	type: FilterType = FilterType.Slider;

	filteredCount = 0;

	initFromMetadata(metaData: SliderFilterMetadata) {
		this.filteredCount = metaData.count;
	}

	incrementFilteredCount(value: number): void {
		this.filteredCount++;
	}

	resetFilteredCount(): void {
		this.filteredCount = 0;
	}
}
