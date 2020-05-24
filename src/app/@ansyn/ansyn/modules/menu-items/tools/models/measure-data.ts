import { IVisualizerEntity } from '@ansyn/imagery';

export interface IMeasureDataOptions {
	isLayerShowed: boolean;
	isToolActive: boolean;
	isRemoveMeasureModeActive: boolean;
}

export interface IMeasureData extends IMeasureDataOptions{
	meausres: IVisualizerEntity[];
}
