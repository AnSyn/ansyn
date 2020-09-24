import { IVisualizerEntity } from '@ansyn/imagery';

export interface IMeasureDataOptions {
	isLayerShowed: boolean;
	isToolActive: boolean;
	isRemoveMeasureModeActive: boolean;
	forceDisableTranslate?: boolean;
}

export interface IMeasureData extends IMeasureDataOptions{
	meausres: IVisualizerEntity[];
}
