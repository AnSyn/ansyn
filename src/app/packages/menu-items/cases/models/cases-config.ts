import { Case } from './case.model';

export interface CasesConfig {
	casesBaseUrl: string,
	casesPaginationLimit: number,
	casesQueryParamsKeys: string[],
	defaultCase: Case,
	updateCaseDebounceTime: number
}
