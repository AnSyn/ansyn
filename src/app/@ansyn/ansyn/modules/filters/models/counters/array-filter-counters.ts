import { Injectable } from '@angular/core';
import { FilterCounters } from './filter-counters.interface';
import { FilterType } from '../filter-type';
import { ArrayFilterMetadata } from '../metadata/array-filter-metadata';

@Injectable()
export class ArrayFilterCounters extends FilterCounters {
	type: FilterType = FilterType.Array;

	filteredCount = 0;

	initFromMetadata(metaData: ArrayFilterMetadata) {
		this.filteredCount = metaData.count;
	}

	incrementFilteredCount(value: number): void {
		this.filteredCount++;
	}

	resetFilteredCount(): void {
		this.filteredCount = 0;
	}
}
