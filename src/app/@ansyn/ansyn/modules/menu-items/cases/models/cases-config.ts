import { IDeltaTime } from '../../../core/public_api';
import { ICase } from '@ansyn/imagery';

export interface ICasesConfig {
	schema: string,
	paginationLimit: number,
	casesQueryParamsKeys: string[],
	defaultCase: ICase,
	updateCaseDebounceTime: number,
	useHash: boolean,
	defaultSearchFromDeltaTime?: IDeltaTime
}
