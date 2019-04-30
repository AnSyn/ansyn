import { CaseGeoFilter } from '../../../../../app/cases/models/case.model';

export enum SearchModeEnum {
	none = 'none'
}

export type SearchMode = CaseGeoFilter | SearchModeEnum;
