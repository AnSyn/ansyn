import { ICoordinatesSystem } from '@ansyn/core';

export interface IToolsConfig {
	Annotations: {
		displayId: '0' | '1';
	},
	GoTo: {
		from: ICoordinatesSystem;
		to: ICoordinatesSystem;
	},
	Proj4: {
		ed50: string;
		ed50Customized: string;
		ed50Notification: string;
	},
	ImageProcParams: Array<IImageProcParam>
}

export interface IImageProcParam {
	name: string,
	defaultValue: number,
	min: number,
	max: number
}

export const toolsConfig = 'toolsConfig';



