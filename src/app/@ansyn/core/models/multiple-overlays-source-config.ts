export const MultipleOverlaysSourceConfig = 'multipleOverlaysSourceConfig';

export interface IDateRange {
	start: Date;
	end: Date;
}

export interface IFiltersList {
	name: string;
	dates: IDateRange[];
	sensorNames: string[];
	coverage: number[][][][];
}

export interface IOverlaysSourceProvider {
	inActive?: boolean;
	whitelist: IFiltersList[];
	blacklist: IFiltersList[];
	dataInputFiltersConfig?: any
}

export interface IMultipleOverlaysSourceConfig {
	defaultProvider: IOverlaysSourceProvider;
	[key: string]: IOverlaysSourceProvider;
}
