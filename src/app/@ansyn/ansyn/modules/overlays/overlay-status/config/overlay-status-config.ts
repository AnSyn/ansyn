export interface IOverlayStatusConfig {
	ImageProcParams: Array<IImageProcParam>,
}

export interface IImageProcParam {
	name: string,
	defaultValue: number,
	min: number,
	max: number
}

export const overlayStatusConfig = 'OverlayStatusConfig';
