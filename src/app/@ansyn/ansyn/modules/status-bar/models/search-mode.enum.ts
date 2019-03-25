import { CaseGeoFilter } from '@ansyn/core';

export enum SearchModeEnum {
	none = 'none'
}

export type SearchMode = CaseGeoFilter | SearchModeEnum;
