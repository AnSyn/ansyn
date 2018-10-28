import { IFilter } from './IFilter';


export interface IFiltersConfig {
	shortFilterListLength: number,
	filters: IFilter[]
}

export const filtersConfig = 'filtersConfig';
