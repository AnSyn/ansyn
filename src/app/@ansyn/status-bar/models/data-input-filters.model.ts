import { DataInputFilterValue } from '@ansyn/core/models/case.model';

export enum CaseDataFilterTitle {
	Partial = 'Partial',
	Full = 'Full'
}

export interface DataInputFilter {
	text: CaseDataFilterTitle,
	value: DataInputFilterValue
}
