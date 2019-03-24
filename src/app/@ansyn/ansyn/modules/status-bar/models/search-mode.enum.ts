import { CaseGeoFilter } from '../../core/public_api';

export enum SearchModeEnum {
	none = 'none'
}

export type SearchMode = CaseGeoFilter | SearchModeEnum;
