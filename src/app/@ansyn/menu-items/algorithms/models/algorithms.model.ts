import { IEntity, IOverlay } from '@ansyn/core';
import { GeometryObject } from 'geojson';

export const AlgorithmsConfig = 'algorithmsConfig';

export interface IAlgorithmConfig {
	maxOverlays: number,
	timeEstimationPerOverlayInMinutes: number,
	regionLengthInMeters: number,
	sensorNames: string[]
}

export interface IAlgorithmsConfig {
	schema: string,
	paginationLimit: number,
	algorithms: {
		[algName: string]: IAlgorithmConfig
	}
}

export type AlgorithmTaskWhichOverlays = 'case_overlays' | 'favorite_overlays' | 'displayed_overlays';

export type AlgorithmTaskStatus = 'New' | 'Sent';

export interface IAlgorithm extends IEntity {
	name: string;
}

export class AlgorithmTaskPreview {
	id: string;
	name: string;
	type: string;
	status: AlgorithmTaskStatus;
	runTime: Date;
}

export interface IAlgorithmsTaskState {
	overlays: IOverlay[];
	masterOverlay: IOverlay;
	region: GeometryObject;
}

export class AlgorithmTask extends AlgorithmTaskPreview {
	state: IAlgorithmsTaskState
}
