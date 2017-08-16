import { ILayerTreeNodeLeaf } from '@ansyn/core';

export class NodeActivationChangedEventArgs {
    public node: ILayerTreeNodeLeaf;
    public newState: boolean;

    constructor(node: ILayerTreeNodeLeaf, newState: boolean) {
        this.node = node;
        this.newState = newState;
    }
}
