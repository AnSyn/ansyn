import { IServerDataLayerContainer } from './server-data-layer-container';
import { IServerDataLayer } from './server-data-layer';

export interface IServerDataLayerContainerRoot {
    id: string;
    name: string;
    type: string;
    dataLayerContainers: IServerDataLayerContainer[];
    dataLayers: IServerDataLayer[];
};
