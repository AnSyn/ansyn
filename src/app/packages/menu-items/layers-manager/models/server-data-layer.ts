import { LayerType } from './layer-type';

export interface IServerDataLayer {
    id: string;
    name: string;
    isChecked: boolean;
    type: LayerType;
};
