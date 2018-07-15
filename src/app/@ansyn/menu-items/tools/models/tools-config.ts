import { InjectionToken } from '@angular/core';
import { ICoordinatesSystem } from '@ansyn/core/models/coordinate-system.model';

export interface IToolsConfig {
	Annotations: {
		displayId: "0" | "1";
	},
	GoTo: {
		from: ICoordinatesSystem;
		to: ICoordinatesSystem;
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



