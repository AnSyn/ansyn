import { IVisualizerEntity } from '@ansyn/imagery';

export interface IMeasureData {
	meausres: IVisualizerEntity[];
	isLayerShowed: boolean;
	isToolActive: boolean;
	isRemoveMeasureModeActive: boolean;
}
