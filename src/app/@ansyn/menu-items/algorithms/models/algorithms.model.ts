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

export class AlgorithmTaskPreview implements IEntity{
	id: string;
	creationTime: Date;
	name: string;
	type: string;
	status: AlgorithmTaskStatus;
	runTime: Date;
}

export class AlgorithmsTaskState {
	overlays: IOverlay[];
	masterOverlay: IOverlay;
	region: GeometryObject;
}

export class AlgorithmTask extends AlgorithmTaskPreview {
	state: AlgorithmsTaskState = new AlgorithmsTaskState();
}
