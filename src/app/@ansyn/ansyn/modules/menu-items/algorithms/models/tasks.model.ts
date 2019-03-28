import { IEntity } from '../../../core/public_api';
import { IDilutedOverlay, IOverlay } from '@ansyn/imagery';
import { GeometryObject } from 'geojson';

export const AlgorithmsConfig = 'algorithmsConfig';

export interface IAlgorithmConfig {
	maxOverlays: number,
	timeEstimationPerOverlayInMinutes: number,
	regionLengthInMeters: number,
	sensorNames: string[]
}

export interface IAlgorithmsConfig {
	baseUrl: string;
	urlSuffix: string;
	schema: string;
	paginationLimit: number;
	algorithms: {
		[algName: string]: IAlgorithmConfig
	};
}

export type AlgorithmTaskWhichOverlays = 'case_overlays' | 'favorite_overlays' | 'displayed_overlays';

export enum AlgorithmTaskStatus {
	NEW = 'New',
	SENT = 'Sent'
}

export class AlgorithmTaskPreview implements IEntity {
	id: string;
	creationTime: Date;
	name: string;
	algorithmName: string;
	status: AlgorithmTaskStatus = AlgorithmTaskStatus.NEW;
	runTime: Date;
}

export class AlgorithmsTaskState {
	overlays: IOverlay[] = [];
	masterOverlay: IOverlay;
	region: GeometryObject;
}

export class DilutedAlgorithmsTaskState {
	overlays: IDilutedOverlay[] = [];
	masterOverlay: IDilutedOverlay;
	region: GeometryObject;
}

export class AlgorithmTask extends AlgorithmTaskPreview {
	state: AlgorithmsTaskState = new AlgorithmsTaskState();
}

export interface ITaskModalData {
	id: string,
	name: string,
	show: boolean
}

export enum TasksPageToShow {
	TASKS_TABLE,
	TASK_FORM
}
