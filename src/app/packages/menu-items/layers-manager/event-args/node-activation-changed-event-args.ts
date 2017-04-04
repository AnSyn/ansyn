import { TreeNode } from 'angular-tree-component';

export class NodeActivationChangedEventArgs {
    public node: TreeNode;
    public newState: boolean;

    constructor(node: TreeNode, newState: boolean) {
        this.node = node;
        this.newState = newState;
    }
}
