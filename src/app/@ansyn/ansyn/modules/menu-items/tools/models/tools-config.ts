import { ICoordinatesSystem } from '@ansyn/core';

export interface IEd50Notification {
	href?: string;
	title: string;
	hrefText?: string;
}

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
		ed50Notification: IEd50Notification;
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



