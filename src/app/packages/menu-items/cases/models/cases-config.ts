import { Case } from './case.model';

export interface ICasesConfig {
	baseUrl: string,
	paginationLimit: number,
	casesQueryParamsKeys: string[],
	defaultCase: Case,
	updateCaseDebounceTime: number,
	useHash: boolean
}
