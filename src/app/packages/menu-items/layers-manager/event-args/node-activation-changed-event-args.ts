import { ILayerTreeNodeLeaf } from './../models/layer-tree-node-leaf';

export class NodeActivationChangedEventArgs {
    public node: ILayerTreeNodeLeaf;
    public newState: boolean;

    constructor(node: ILayerTreeNodeLeaf, newState: boolean) {
        this.node = node;
        this.newState = newState;
    }
}
