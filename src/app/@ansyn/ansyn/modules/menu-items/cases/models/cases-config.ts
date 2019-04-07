import { IDeltaTime } from '../../../core/models/time.model';
import { ICase } from './case.model';

export interface ICasesConfig {
	schema: string,
	paginationLimit: number,
	casesQueryParamsKeys: string[],
	defaultCase: ICase,
	updateCaseDebounceTime: number,
	useHash: boolean,
	defaultSearchFromDeltaTime?: IDeltaTime
}
