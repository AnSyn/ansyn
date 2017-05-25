import { Position } from '@ansyn/core';

export type MapState = {
	id: string;
	data: {
		position: Position
	};
	settings: {	mapType: string, mapModes: string[]}[];
}

export const BaseSettings = [{"mapType": "openLayerMap", "mapModes": []}];
