import { Injectable } from '@angular/core';
import { FilterCounters } from './filter-counters.interface';
import { FilterType } from '../filter-type';
import { EnumFilterMetadata } from '../metadata/enum-filter-metadata';

export interface IEnumCounter {
	filteredCount: number;
}

@Injectable()
export class EnumFilterCounters extends FilterCounters {
	type: FilterType = FilterType.Enum;

	enumsFields: Map<string, IEnumCounter> = new Map<string, IEnumCounter>();

	initFromMetadata(metaData: EnumFilterMetadata) {
		this.enumsFields = new Map<string, IEnumCounter>();
		metaData.enumsFields.forEach((value, key) => {
			this.enumsFields.set(key, {
				filteredCount: value.count
			});
		})
	}

	incrementFilteredCount(value: any): void {
		// Adding a safety check. If we get a filter value whose counter was not
		// initialized, we initialize the counter here (and since we also need
		// to increment the counter, we initialize to 1 instead of to 0)
		if (this.enumsFields.has(value)) {
			this.enumsFields.get(value).filteredCount = this.enumsFields.get(value).filteredCount + 1;
		} else {
			this.enumsFields.set(value, { filteredCount: 1 })
		}
	}

	resetFilteredCount(): void {
		this.enumsFields.forEach((val) => {
			val.filteredCount = 0;
		});
	}
}
