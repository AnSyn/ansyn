import { ImageryMapPosition } from '@ansyn/imagery';

export interface IOverlayStatusConfig {
	ImageProcParams: Array<IImageProcParam>,
	defaultPosition: ImageryMapPosition;
}

export interface IImageProcParam {
	name: string,
	defaultValue: number,
	min: number,
	max: number
}

export const overlayStatusConfig = 'OverlayStatusConfig';
