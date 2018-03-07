import { InjectionToken } from '@angular/core';
import { CoordinatesSystem } from '@ansyn/core';

export interface IToolsConfig {
	GoTo: {
		from: CoordinatesSystem;
		to: CoordinatesSystem;
	},
	Proj4: {
		ed50: string;
		ed50Customized: string;
	},
	ImageProcParams: Array<IImageProcParam>
}

export interface IImageProcParam {
	name: string,
	defaultValue: number,
	min: number,
	max: number
}

export const toolsConfig: InjectionToken<IToolsConfig> = new InjectionToken('toolsConfig');



