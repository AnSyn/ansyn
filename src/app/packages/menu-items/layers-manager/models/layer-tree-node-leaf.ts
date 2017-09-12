import { ILayerTreeNode } from './layer-tree-node';

export interface ILayerTreeNodeLeaf extends ILayerTreeNode {
	url: string;
};
