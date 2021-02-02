import { IImageryMapPosition } from './case-map-position.model';
export type MapOrientation = 'User Perspective' | 'Imagery Perspective';

export interface IWorldViewMapState {
	mapType: string;
	sourceType: string;
}

export interface IMapSettingsData {
	position: IImageryMapPosition;
	overlaysFootprintActive?: boolean;
	[key: string]: any;
}

export interface IMapSettings {
	id: string;
	worldView: IWorldViewMapState;
	data: IMapSettingsData;
	orientation: MapOrientation;
	flags: {
		hideLayers?: boolean;
	};
}
