import { ILayerTreeNode } from './layer-tree-node';
import { LayerType } from './layer-type';

export interface ILayerTreeNodeRoot extends ILayerTreeNode {
	type: LayerType;
}
