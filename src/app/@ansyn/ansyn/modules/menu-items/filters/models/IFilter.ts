import { FilterType } from '@ansyn/core';

export interface IFilter {
	modelName: string;
	displayName: string;
	type: FilterType;
	customData?: any;
}
