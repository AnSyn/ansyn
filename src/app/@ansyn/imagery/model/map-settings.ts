import {
	ICompressedImageryMapProjectedState,
	ImageryMapPosition
} from './case-map-position.model';
export type MapOrientation = 'User Perspective' | 'Imagery Perspective';

export interface IWorldViewMapState {
	mapType: string;
	sourceType: string;
}

export interface ICompressedWorldViewMapState {
	map: string;
	source: string;
}


export interface IMapSettingsData {
	position: ImageryMapPosition;

	[key: string]: any;
}

export interface ICompressedMapSettingsData {
	p: ICompressedImageryMapProjectedState;

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

export interface ICompressedMapSettings {
	id: string;
	w: ICompressedWorldViewMapState;
	o: MapOrientation;
	f: {
		hideLayers?: boolean;
	};
}
