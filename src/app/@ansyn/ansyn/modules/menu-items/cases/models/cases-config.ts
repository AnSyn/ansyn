import { IDeltaTime } from '../../../core/models/time.model';
import { ICase, ICasePreview } from './case.model';
import { Dictionary } from '@ngrx/entity';

export enum CasesType {
	MyCases = 'owner',
	MySharedCases = 'sharedWith'
}

export interface ICasesConfig {
	schema: string,
	paginationLimit: number,
	defaultCase: ICase,
	updateCaseDebounceTime: number,
	useHash: boolean,
	defaultSearchFromDeltaTime?: IDeltaTime
}
