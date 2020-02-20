import { ICoordinatesSystem } from '@ansyn/map-facade';

export interface IShadowMouseConfig {
	activeByDefault: boolean,
	forceSendShadowMousePosition: boolean
}

export interface IToolsConfig {
	GoTo: {
		geoWgs84: ICoordinatesSystem;
		utmEd50: ICoordinatesSystem;
		utmWgs84: ICoordinatesSystem;
	},
	ImageProcParams: Array<IImageProcParam>,
	ShadowMouse?: IShadowMouseConfig
}

export interface IImageProcParam {
	name: string,
	defaultValue: number,
	min: number,
	max: number
}

export const toolsConfig = 'toolsConfig';



