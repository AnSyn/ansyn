import { ILayer } from '../models/layers.model';

export enum SelectedModalEnum {
	none= 'none',
	download = 'download',
	remove = 'remove',
	edit = 'edit'
}

export interface ILayerModal {
	readonly layer: ILayer;
	type: SelectedModalEnum;
}
