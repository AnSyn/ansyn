export type CaseMapExtent = [number, number, number, number];

export interface CaseMapProjectedState {
	projection: {
		code: string;
	};
	center?: [number, number];
	resolution?: number;
	rotation?: number
	zoom?: number;
}

export interface CaseMapPosition {
	extent: CaseMapExtent;
	projectedState: CaseMapProjectedState
}
