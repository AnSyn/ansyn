import { IVisualizerEntity } from '@ansyn/imagery';

export enum toolsFlags {
	geoRegisteredOptionsEnabled = 'geoRegisteredOptionsEnabled',
	shadowMouse = 'shadowMouse',
	shadowMouseDisabled = 'shadowMouseDisabled',
	shadowMouseActiveForManyScreens = 'shadowMouseActiveForManyScreens',
	forceShadowMouse = 'forceShadowMouse',
	pinLocation = 'pinLocation',
	isMeasureToolActive = 'isMeasureToolActive'
}

export enum SubMenuEnum { goTo, overlays, annotations }

export interface IMeasureDataOptions {
	isLayerShowed: boolean;
	isToolActive: boolean;
	isRemoveMeasureModeActive: boolean;
	forceDisableTranslate?: boolean;
}

export interface IMeasureData extends IMeasureDataOptions{
	measures: IVisualizerEntity[];
}

export function createNewMeasureData(): IMeasureData {
	return {
		isLayerShowed: true,
		isToolActive: true,
		isRemoveMeasureModeActive: false,
		measures: []
	}
}
