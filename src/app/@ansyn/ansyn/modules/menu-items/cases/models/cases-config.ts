import { ICase, IDeltaTime } from '../../../core/public_api';

export interface ICasesConfig {
	schema: string,
	paginationLimit: number,
	casesQueryParamsKeys: string[],
	defaultCase: ICase,
	updateCaseDebounceTime: number,
	useHash: boolean,
	defaultSearchFromDeltaTime?: IDeltaTime
}
