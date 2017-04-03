import { TreeNode } from 'angular-tree-component';

export class NodeActivationChangedEventArgs {
    constructor(public node: TreeNode, public newState: boolean) {

    }
}
