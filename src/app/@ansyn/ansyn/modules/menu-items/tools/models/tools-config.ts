import { ICoordinatesSystem } from '@ansyn/map-facade';

export interface IShadowMouseConfig {
	activeByDefault: boolean,
	forceSendShadowMousePosition: boolean
}

export interface IToolsConfig {
	ShadowMouse?: IShadowMouseConfig
}

export const toolsConfig = 'toolsConfig';



