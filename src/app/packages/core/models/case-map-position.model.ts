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

export interface ICaseResolutionData {
	center: [number, number];
	refPoint1: [number, number];
	refPoint2: [number, number];
	mapResolution: number;
}

export interface CaseMapPosition {
	extent: CaseMapExtent;
	resolutionData?: ICaseResolutionData;
	projectedState: CaseMapProjectedState;
}
