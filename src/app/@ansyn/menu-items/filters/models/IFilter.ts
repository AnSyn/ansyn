import { FilterType } from '@ansyn/core/models/case.model';

export interface IFilter {
	modelName: string;
	displayName: string;
	type: FilterType;
	customData?: any;
}
