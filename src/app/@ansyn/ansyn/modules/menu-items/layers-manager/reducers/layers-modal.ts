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
