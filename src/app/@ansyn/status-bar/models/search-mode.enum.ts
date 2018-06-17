import { CaseGeoFilter } from '@ansyn/core/models/case.model';

export enum SearchModeEnum {
	none = 'none'
}

export type SearchMode = CaseGeoFilter | SearchModeEnum;
