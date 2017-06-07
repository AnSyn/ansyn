import { Position } from '@ansyn/core';

export type MapState = {
	id: string;
	data: {
		position: Position
	};
	"mapType": string;
};

// TODO: Need to get the real map Type from store
export const defaultMapType = "openLayersMap";
