import { CaseGeoFilter } from '@ansyn/imagery';

export enum SearchModeEnum {
	none = 'none'
}

export type SearchMode = CaseGeoFilter | SearchModeEnum;
