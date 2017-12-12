export type CaseMapExtent = [number, number, number, number];

export interface CaseMapPosition {
	rotation?: number;
	extent: CaseMapExtent;
	resolution: number;
}
