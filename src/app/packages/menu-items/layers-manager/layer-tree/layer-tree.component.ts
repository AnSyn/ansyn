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
      actionMapping: this.actionMappingService.getActionMapping()
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

  private onTreeInitialized(event): void {
    this.initializeNodes();
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
}


