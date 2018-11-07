
export const AlgorithmsConfig = 'algorithmsConfig';

export interface IAlgorithmsConfig {
	maxOverlays: number,
	timeEstimationPerOverlayInMinutes: number,
	sensorNames: string[]
}

export type WhichOverlays = 'case_overlays' | 'favorite_overlays' | 'displayed_overlays';
