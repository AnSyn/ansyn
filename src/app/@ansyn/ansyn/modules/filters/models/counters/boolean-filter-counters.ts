import { FilterType } from '../filter-type';
import { Injectable } from '@angular/core';
import { FilterCounters } from './filter-counters.interface';
import { BooleanFilterMetadata } from '../metadata/boolean-filter-metadata';

export interface IBooleanCounter {
	filteredCount: number;
}

export interface IBooleanCounters {
	true: IBooleanCounter;
	false: IBooleanCounter;
}

@Injectable()
export class BooleanFilterCounters extends FilterCounters {
	type: FilterType = FilterType.Boolean;

	properties: IBooleanCounters = {
		true: {
			filteredCount: 0
		},
		false: {
			filteredCount: 0
		}
	};

	initFromMetadata(metaData: BooleanFilterMetadata) {
		Object.keys(metaData.properties).forEach(key => {
			this.properties[key].filteredCount = metaData.properties[key].count;
		});
	}

	resetFilteredCount(): void {
		this.properties.true.filteredCount = 0;
		this.properties.false.filteredCount = 0;
	}

	incrementFilteredCount(value: boolean): void {
		if (value) {
			this.properties.true.filteredCount += 1;
		} else {
			this.properties.false.filteredCount += 1;
		}
	}
}
