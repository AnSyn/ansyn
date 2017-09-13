import { IServerDataLayer } from './server-data-layer';

export interface IServerDataLayerContainer {
	id: string;
	name: string;
	dataLayerContainers: IServerDataLayerContainer[];
	dataLayers: IServerDataLayer[];
}
