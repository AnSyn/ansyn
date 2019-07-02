import { ICoordinatesSystem } from '@ansyn/map-facade';

export interface IShadowMouseConfig {
	activeByDefault: boolean
}

export interface IToolsConfig {
	GoTo: {
		from: ICoordinatesSystem;
		to: ICoordinatesSystem;
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



