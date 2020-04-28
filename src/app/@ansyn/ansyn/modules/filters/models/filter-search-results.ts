export type FilterSearchResult = 'all' | string[];

export interface IFilterSearchResults {
	[key: string]: FilterSearchResult;
}
