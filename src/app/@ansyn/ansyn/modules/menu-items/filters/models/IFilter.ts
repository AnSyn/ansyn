import { FilterType } from '../../../core/public_api';

export interface IFilter {
	modelName: string;
	displayName: string;
	type: FilterType;
	customData?: any;
}
