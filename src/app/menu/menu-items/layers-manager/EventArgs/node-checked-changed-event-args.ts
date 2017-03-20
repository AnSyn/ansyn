import { TreeNode } from 'angular-tree-component';

export class NodeCheckedChangedEventArgs {
    constructor(public checkedNode: TreeNode, public isChecked: boolean) {

    }
}
