import { ILayerTreeNode } from './layer-tree-node';

export interface IVisibleLayerNode extends ILayerTreeNode {
    type: any; // vector, map
    isReadOnly: boolean;
    layerData: {
        data: any
        type: string //wkt, wms
    }
}
