import { Case } from './case.model';

export interface CasesConfig {
	casesBaseUrl: string,
	casesPaginationLimit: number,
	defaultCase: Case,
	updateCaseDebounceTime: number
}
