import { IImageryMapPosition } from './case-map-position.model';
export type MapOrientation = 'User Perspective' | 'Imagery Perspective';

export interface IWorldViewMapState {
	mapType: string;
	sourceType: string;
}

export interface IMapSettingsData {
	position: IImageryMapPosition;

	[key: string]: any;
}

export interface IMapSettings {
	id: string;
	worldView: IWorldViewMapState;
	data: IMapSettingsData;
	orientation?: MapOrientation;
	flags: {
		hideLayers?: boolean;
	};
}
