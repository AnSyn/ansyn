import { FilterType } from '../filter-type';
import { FilterMetadata } from '../metadata/filter-metadata.interface';

export abstract class FilterCounters {
	type: FilterType;

	abstract initFromMetadata(metadata: FilterMetadata): void;

	abstract incrementFilteredCount(value: any): void;

	abstract resetFilteredCount(): void;
}

