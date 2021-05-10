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
	showOnlyMyChildren?: boolean;
	dataInputFiltersConfig?: any;
}

export interface IMultipleOverlaysSourceConfig {
	sensorsTypes: {
		[sensorType: string]: string;
	}
	sensorNamesByGroup: {
		[groupName: string]: string[]
	};
	enableExerciseImages: boolean;
	useAngleDebugMode: boolean;
	defaultProvider: IOverlaysSourceProvider;
	diagonalSensorNames: string[];
	indexProviders: IIndexProviders;
}

export interface IIndexProviders {
	[key: string]: IOverlaysSourceProvider;
}
