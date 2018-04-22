import { IServerDataLayerContainer } from './server-data-layer-container';
import { IServerDataLayer } from './server-data-layer';
import { LayerType } from './layer-type';

export interface IServerDataLayerContainerRoot {
	id: string;
	name: string;
	type: LayerType;
	dataLayers: IServerDataLayer[];
	dataLayerContainers: IServerDataLayerContainer[];
}
