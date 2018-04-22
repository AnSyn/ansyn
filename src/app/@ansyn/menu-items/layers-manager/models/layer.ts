import { LayerType } from './layer-type';

export interface Layer {
	name: string;
	id: string;
	isChecked: boolean;
	isIndeterminate: boolean;
	url: string;
	// type: LayerType;
}
