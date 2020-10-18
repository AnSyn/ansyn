import { ILayer } from '../models/layers.model';

export enum SelectedModalEnum {
	none,
	download,
	remove,
	edit
}

export interface ILayerModal {
	readonly layer: ILayer;
	type: SelectedModalEnum;
}

export function getDefaultLayerIdFromLayerArray (layers: ILayer[]) {
	return layers.find(layer => layer.name === 'Default').id;
}
