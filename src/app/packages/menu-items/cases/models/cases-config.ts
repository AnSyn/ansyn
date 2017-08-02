import { Case } from './case.model';

export interface CasesConfig {
	baseUrl: string,
	paginationLimit: number,
	casesQueryParamsKeys: string[],
	defaultCase: Case,
	updateCaseDebounceTime: number,
	useHash: boolean
}
