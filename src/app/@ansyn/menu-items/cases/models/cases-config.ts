import { Case } from './case.model';

export interface ICasesConfig {
	schema: string,
	paginationLimit: number,
	casesQueryParamsKeys: string[],
	defaultCase: Case,
	updateCaseDebounceTime: number,
	useHash: boolean
}
