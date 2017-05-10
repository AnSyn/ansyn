import { ILayerTreeNode } from './../models/layer-tree-node';

export class NodeActivationChangedEventArgs {
    public node: ILayerTreeNode;
    public newState: boolean;

    constructor(node: ILayerTreeNode, newState: boolean) {
        this.node = node;
        this.newState = newState;
    }
}
