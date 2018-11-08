import { IEntity } from '@ansyn/core';

export const AlgorithmsConfig = 'algorithmsConfig';

export interface IAlgorithmsConfig {
	maxOverlays: number,
	timeEstimationPerOverlayInMinutes: number,
	sensorNames: string[]
}

export type WhichOverlays = 'case_overlays' | 'favorite_overlays' | 'displayed_overlays';

export interface IAlgorithm extends IEntity {
	name: string;
}
