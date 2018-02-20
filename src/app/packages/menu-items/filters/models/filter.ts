import { FilterType } from '@ansyn/core/models/case.model';

export interface Filter {
	modelName: string;
	displayName: string;
	type: FilterType;
	customData?: any;
}
