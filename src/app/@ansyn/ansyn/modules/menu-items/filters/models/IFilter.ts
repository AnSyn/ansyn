import { FilterType } from '@ansyn/imagery';

export interface IFilter {
	modelName: string;
	displayName: string;
	type: FilterType;
	customData?: any;
}
