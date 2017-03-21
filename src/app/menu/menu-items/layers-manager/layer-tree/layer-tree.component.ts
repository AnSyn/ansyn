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

  private checkedChanged(node: TreeNode, event): void {
    for (let childNode of node.children) {
      childNode.setIsActive(event.target.checked, true);
    }
  }

}
