import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { NodeActivationChangedEventArgs } from '../event-args/node-activation-changed-event-args';
import { TreeActionMappingServiceService } from '../services/tree-action-mapping-service.service';
import { TreeNode, TreeComponent } from 'angular-tree-component';

@Component({
  selector: 'app-layer-tree',
  templateUrl: './layer-tree.component.html',
  styleUrls: ['./layer-tree.component.scss'],
  providers: [TreeActionMappingServiceService]
})

export class LayerTreeComponent implements OnInit {

  private options;

  @ViewChild(TreeComponent) treeComponent: TreeComponent;

  @Input() public source: any[];

  @Output() public nodeActivationChanged = new EventEmitter<NodeActivationChangedEventArgs>();

  constructor(private actionMappingService: TreeActionMappingServiceService) { }

  ngOnInit() {
    this.options = {
      getChildren: () => new Promise((resolve, reject) => { }),
      actionMapping: this.actionMappingService.getActionMapping()
    };
  }

  private onNodeActivated(event): void {
    this.nodeActivationChanged.emit(new NodeActivationChangedEventArgs(event.node, true));

    event.node.children.forEach((childNode) => {
      childNode.setIsActive(true, true);
    });

    let parentNode: TreeNode = event.node.realParent;
    if (parentNode &&
      !parentNode.isActive &&
      parentNode.children.every(child => child.isActive)) {
      parentNode.setIsActive(true, true);
    }
  }

  private onNodeDeactivated(event): void {
    this.nodeActivationChanged.emit(new NodeActivationChangedEventArgs(event.node, false));

    event.node.children.forEach((childNode) => {
      childNode.setIsActive(false, true);
    });

    let parentNode: TreeNode = event.node.realParent;
    if (parentNode &&
      parentNode.isActive &&
      parentNode.children.every(child => !child.isActive)) {
      parentNode.setIsActive(false, true);
    }
  }

  private isNodeIndeterminate(node: TreeNode): boolean {
    if (!node.hasChildren) {
      return false;
    }

    let flattenedChildren: TreeNode[] = this.getFlattenedChildren(node, true);

    let allChildrenActive: boolean = flattenedChildren.every(child => child.isActive);
    let allChildrenDeactive: boolean = flattenedChildren.every(child => !child.isActive);

    if (allChildrenActive || allChildrenDeactive) {
      return false;
    } else {
      return true;
    }
  }

  private getFlattenedChildren(node: TreeNode, isRoot: boolean): TreeNode[] {
    let flattenedArray: TreeNode[] = [];

    if (!node.hasChildren) {
      flattenedArray.push(node);
    } else {
      flattenedArray =
        Array.prototype.concat.apply([], node.children.map(child => this.getFlattenedChildren(child, false)));
      if (!isRoot) {
        flattenedArray.push(node);
      }
    }

    return flattenedArray;
  }
}


