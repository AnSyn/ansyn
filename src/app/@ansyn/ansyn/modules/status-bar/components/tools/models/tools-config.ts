export interface IShadowMouseConfig {
	activeByDefault: boolean,
	forceSendShadowMousePosition: boolean
}

export interface IToolsConfig {
	ShadowMouse?: IShadowMouseConfig,
	exportMap?: {
		target: string,
		excludeClasses: string[]
	}
}

export const toolsConfig = 'toolsConfig';



