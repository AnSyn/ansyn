import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NodeCheckedChangedEventArgs } from '../EventArgs/node-checked-changed-event-args';
import { TreeActionMappingServiceService } from '../services/tree-action-mapping-service.service';
import { TreeNode } from 'angular-tree-component';

@Component({
  selector: 'app-layer-tree',
  templateUrl: './layer-tree.component.html',
  styleUrls: ['./layer-tree.component.scss'],
  providers: [TreeActionMappingServiceService]
})

export class LayerTreeComponent implements OnInit {

  @Input() public source: any[];

  @Output() public nodeCheckedChanged = new EventEmitter<NodeCheckedChangedEventArgs>();

  private options;

  constructor(private actionMappingService: TreeActionMappingServiceService) { }

  ngOnInit() {
    this.options = {
      getChildren: () => new Promise((resolve, reject) => { }),
      actionMapping: this.actionMappingService.getActionMapping()
    };
  }

  private onNodeActivated(event): void {
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

    let allChildrenActive: boolean = node.children.every(child => child.isActive);
    let allChildrenDeactive: boolean = node.children.every(child => !child.isActive);

    if (allChildrenActive || allChildrenDeactive) {
      return false;
    } else {
      return true;
    }
  }
}
