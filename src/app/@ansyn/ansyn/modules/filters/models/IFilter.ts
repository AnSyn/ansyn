import { FilterType } from './filter-type';

export interface IFilter {
	modelName: string;
	displayName: string;
	type: FilterType;
	customData?: any;
	visibility?: boolean;
}
