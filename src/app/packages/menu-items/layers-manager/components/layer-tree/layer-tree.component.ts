import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { OnInit, AfterViewInit } from '@angular/core';
import { NodeActivationChangedEventArgs } from '../../event-args/node-activation-changed-event-args';
import { TreeActionMappingService } from '../../services/tree-action-mapping.service';
import { TreeNode, TreeComponent } from 'angular-tree-component';
import { ILayerTreeNode } from '@ansyn/core';
import { Observable } from 'rxjs/Observable';
import { findNodesByFilterFunc, leafFilterFunction } from '../../utils/layers.utils';

@Component({
  selector: 'ansyn-layer-tree',
  templateUrl: './layer-tree.component.html',
  styleUrls: ['./layer-tree.component.less'],
  providers: [TreeActionMappingService]
})

export class LayerTreeComponent implements OnInit, AfterViewInit {

  options;

  @ViewChild(TreeComponent) treeComponent: TreeComponent;

  @Input() source: Observable<ILayerTreeNode[]>;

  @Output() nodeActivationChanged = new EventEmitter<NodeActivationChangedEventArgs>();

  constructor(private actionMappingService: TreeActionMappingService, private myElement: ElementRef) { }

  ngOnInit() {
    this.options = {
      getChildren: () => new Promise((resolve, reject) => { }),
      actionMapping: this.actionMappingService.getActionMapping(),
      useVirtualScroll: true,
      nodeHeight: 24
    };
  }

  ngAfterViewInit() {
    this.treeComponent.treeModel.virtualScroll.setViewport(this.myElement.nativeElement);
  }

  public onDivClicked(event, node: TreeNode): void {
    if (event.target.type === 'checkbox') {
      return;
    }
    this.onCheckboxClicked(null, node);
    event.stopPropagation();
  }

  public onSpanClicked(event, node: TreeNode): void {
    this.onCheckboxClicked(null, node);
    event.stopPropagation();
  }

  public onCheckboxClicked(event, node: TreeNode): void {
    let newCheckValue: boolean = !node.data.isChecked;
    let parentNode: TreeNode = node.realParent;

    this.nodeActivationChanged.emit(new NodeActivationChangedEventArgs(node.data, newCheckValue));
  }
};



