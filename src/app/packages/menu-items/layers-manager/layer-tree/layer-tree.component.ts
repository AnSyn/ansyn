import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { OnInit, SimpleChanges, AfterViewInit } from '@angular/core';
import { NodeActivationChangedEventArgs } from '../event-args/node-activation-changed-event-args';
import { TreeActionMappingService } from '../services/tree-action-mapping.service';
import { TreeNode, TreeComponent } from 'angular-tree-component';
import { ILayerTreeNode } from '@ansyn/core';

@Component({
  selector: 'app-layer-tree',
  templateUrl: './layer-tree.component.html',
  styleUrls: ['./layer-tree.component.scss'],
  providers: [TreeActionMappingService]
})

export class LayerTreeComponent implements OnInit, AfterViewInit {

  private options;

  @ViewChild(TreeComponent) treeComponent: TreeComponent;

  @Input() source: ILayerTreeNode[];

  @Output() public nodeActivationChanged = new EventEmitter<NodeActivationChangedEventArgs>();

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
    this.treeComponent.treeModel.virtualScroll.setViewport( this.myElement.nativeElement );
  }

  private initializeNodes() {
    if (this.source) {
      this.flattenInputNodes().filter((node: ILayerTreeNode) => node.isChecked).
        forEach((node: ILayerTreeNode) => this.treeComponent.treeModel.getNodeBy(treeNode => treeNode.data.id === node.id).
          setIsActive(true, true));
    }
  }

  private onNodeActivated(event): void {
    let node: TreeNode = event.node;
    this.nodeActivationChanged.emit(new NodeActivationChangedEventArgs(node, true));

    for (let i = 0; i < node.children.length; i++) {
      if (!node.children[i].isActive) {
        node.children[i].setIsActive(true, true);
      }
    }

    let parentNode: TreeNode = node.realParent;
    if (parentNode &&
      !parentNode.isActive &&
      parentNode.children.every(child => child.isActive)) {
      parentNode.setIsActive(true, true);
    }

    if (parentNode && node.isLeaf) {
      this.bubbleIndeterminate(parentNode);
    }
  }

  private onNodeDeactivated(event): void {
    let node: TreeNode = event.node;

    this.nodeActivationChanged.emit(new NodeActivationChangedEventArgs(node, false));

    for (let i = 0; i < node.children.length; i++) {
      if (node.children[i].isActive) {
        node.children[i].setIsActive(false, true);
      }
    }

    let parentNode: TreeNode = node.realParent;
    if (parentNode &&
      parentNode.isActive &&
      parentNode.children.every(child => !child.isActive)) {
      parentNode.setIsActive(false, true);
    }

    if (parentNode && node.isLeaf) {
      this.bubbleIndeterminate(parentNode);
    }
  }

  private onTreeInitialized(event): void {
    this.initializeNodes();
  }

  private bubbleIndeterminate(node: TreeNode): void {
    node.data.indeterminate = this.isNodeIndeterminate(node);
    if (node.realParent) {
      this.bubbleIndeterminate(node.realParent);
    }
  }

  private isNodeIndeterminate(node: TreeNode): boolean {
    if (!node.hasChildren) {
      return false;
    }

    if (node.children.every(child => child.isActive) || node.children.every(child => !child.isActive)) {
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

  private flattenInputNodes(): ILayerTreeNode[] {
    let flattenedTree: ILayerTreeNode[] = [];

    this.source.forEach(node => this.treeVisitor(node, flattenedTree));

    return flattenedTree;
  }

  private treeVisitor(rootNode: ILayerTreeNode, flattenedArray: ILayerTreeNode[] = []): ILayerTreeNode[] {
    flattenedArray.push(rootNode);

    rootNode.children.forEach((child: ILayerTreeNode) => this.treeVisitor(child, flattenedArray));

    return flattenedArray;
  }
};



