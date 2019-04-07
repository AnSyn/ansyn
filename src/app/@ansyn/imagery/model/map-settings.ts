import { ICaseMapPosition } from './case-map-position.model';

export interface IWorldViewMapState {
	mapType: string;
	sourceType: string;
}

export interface IMapSettingsData {
	position: ICaseMapPosition;
	[key: string]: any;
}

export interface IMapSettings {
	id: string;
	worldView: IWorldViewMapState;
	data: IMapSettingsData;
	flags: {
		displayLayers?: boolean;
	};
}
