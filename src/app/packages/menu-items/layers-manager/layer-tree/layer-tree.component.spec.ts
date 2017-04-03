import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { LayerTreeComponent } from './layer-tree.component';
import { LayersManagerModule } from '../layers-manager.module';
import { CoreModule } from '../../../core/core.module';
import { ILayerTreeNode } from '../models/layer-tree-node'
import { TreeNode } from 'angular-tree-component';

fdescribe('LayerTreeComponent', () => {
  let component: LayerTreeComponent;
  let fixture: ComponentFixture<LayerTreeComponent>;
  let allFalseNodes: ILayerTreeNode[] = [{
    name: 'Fields',
    id: 1,
    isChecked: false,
    children: [
      {
        name: 'Rice Fields', id: 2, isChecked: false, children: [
          { name: 'Brown Rice', id: 5, isChecked: false, children: [] },
          { name: 'Persian Rice', id: 6, isChecked: false, children: [] }]
      },
      { name: 'Wheat Fields', id: 3, isChecked: false, children: [] },
      { name: 'Oat Fields', id: 4, isChecked: false, children: [] }
    ]
  }];

  let trueRootNodes: ILayerTreeNode[] = [{
    name: 'Fields',
    id: 1,
    isChecked: true,
    children: [
      {
        name: 'Rice Fields', id: 2, isChecked: false, children: [
          { name: 'Brown Rice', id: 5, isChecked: false, children: [] },
          { name: 'Persian Rice', id: 6, isChecked: false, children: [] }]
      },
      { name: 'Wheat Fields', id: 3, isChecked: false, children: [] },
      { name: 'Oat Fields', id: 4, isChecked: false, children: [] }
    ]
  }];

  function flattenNodeTree(rootNode: ILayerTreeNode, flattenedArray: ILayerTreeNode[] = []): ILayerTreeNode[] {
    flattenedArray.push(rootNode);

    rootNode.children.forEach((child: ILayerTreeNode) => flattenNodeTree(child, flattenedArray));

    return flattenedArray;
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [LayersManagerModule, CoreModule],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayerTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize treeview after nodes was assigned', () => {
    component.source = allFalseNodes;
    fixture.detectChanges();
    component.treeComponent.treeModel.expandAll();
    fixture.detectChanges();

    const allSpans: Array<HTMLSpanElement> = Array.from<HTMLSpanElement>(fixture.nativeElement.querySelectorAll('span.title'));
    const allNodes: ILayerTreeNode[] = flattenNodeTree(allFalseNodes[0]);

    expect(allSpans.length).toEqual(allNodes.length);
    expect(allSpans.map(span => span.textContent)).toEqual(allNodes.map(node => node.name));
  });

  it('selection in the root should bubble to its children', () => {
    let activatedNodes: TreeNode[] = [];

    component.source = allFalseNodes;
    fixture.detectChanges();
    component.treeComponent.treeModel.expandAll();
    fixture.detectChanges();

    component.nodeActivationChanged.subscribe((event) => {
      if (event.newState) {
        activatedNodes.push(event.node);
      } else {
        let nodeIndex: number = activatedNodes.indexOf(event.node)
        activatedNodes.splice(nodeIndex, 1);
      }
    });

    const rootDiv: HTMLElement = fixture.debugElement.query(By.css('#node' + allFalseNodes[0].id)).nativeElement;
    const allNodes: ILayerTreeNode[] = flattenNodeTree(allFalseNodes[0]);

    rootDiv.click();
    fixture.detectChanges();

    expect(activatedNodes.find(node => node.data.id === 1)).toBeTruthy();
    expect(activatedNodes.find(node => node.data.id === 2)).toBeTruthy();
    expect(activatedNodes.find(node => node.data.id === 3)).toBeTruthy();
    expect(activatedNodes.find(node => node.data.id === 4)).toBeTruthy();
    expect(activatedNodes.find(node => node.data.id === 5)).toBeTruthy();
    expect(activatedNodes.find(node => node.data.id === 6)).toBeTruthy();

    expect(fixture.debugElement.query(By.css('#node1 > input')).nativeElement.checked).toBeTruthy();
    expect(fixture.debugElement.query(By.css('#node2 > input')).nativeElement.checked).toBeTruthy();
    expect(fixture.debugElement.query(By.css('#node3 > input')).nativeElement.checked).toBeTruthy();
    expect(fixture.debugElement.query(By.css('#node4 > input')).nativeElement.checked).toBeTruthy();
    expect(fixture.debugElement.query(By.css('#node5 > input')).nativeElement.checked).toBeTruthy();
    expect(fixture.debugElement.query(By.css('#node6 > input')).nativeElement.checked).toBeTruthy();
  });

  it('selection in sub children should select the parent, and set indeterminate in the grandparent', () => {
    let activatedNodes: TreeNode[] = [];
    component.source = allFalseNodes;
    fixture.detectChanges();
    component.treeComponent.treeModel.expandAll();
    fixture.detectChanges();

    component.nodeActivationChanged.subscribe((event) => {
      if (event.newState) {
        activatedNodes.push(event.node);
      } else {
        let nodeIndex: number = activatedNodes.indexOf(event.node)
        activatedNodes.splice(nodeIndex, 1);
      }
    });

    const brownRiceNode: HTMLElement = fixture.debugElement.query(By.css('#node5')).nativeElement;
    const persianRiceNode: HTMLElement = fixture.debugElement.query(By.css('#node6')).nativeElement;

    brownRiceNode.click();
    persianRiceNode.click();
    fixture.detectChanges();

    expect(activatedNodes.find(node => node.data.id === 1)).toBeFalsy();
    expect(activatedNodes.find(node => node.data.id === 2)).toBeTruthy();
    expect(activatedNodes.find(node => node.data.id === 3)).toBeFalsy();
    expect(activatedNodes.find(node => node.data.id === 4)).toBeFalsy();
    expect(activatedNodes.find(node => node.data.id === 5)).toBeTruthy();
    expect(activatedNodes.find(node => node.data.id === 6)).toBeTruthy();

    expect(fixture.debugElement.query(By.css('#node1 > input')).nativeElement.checked).toBeFalsy();
    expect(fixture.debugElement.query(By.css('#node2 > input')).nativeElement.checked).toBeTruthy();
    expect(fixture.debugElement.query(By.css('#node3 > input')).nativeElement.checked).toBeFalsy();
    expect(fixture.debugElement.query(By.css('#node4 > input')).nativeElement.checked).toBeFalsy();
    expect(fixture.debugElement.query(By.css('#node5 > input')).nativeElement.checked).toBeTruthy();
    expect(fixture.debugElement.query(By.css('#node6 > input')).nativeElement.checked).toBeTruthy();

    const riceParentInput: HTMLInputElement = fixture.debugElement.query(By.css('#node1 > input')).nativeElement;
    expect(riceParentInput.indeterminate).toBe(true);
  });

  it('selection and unselection in sub children should return to the initial state', () => {
    let activatedNodes: TreeNode[] = [];
    component.source = allFalseNodes;
    fixture.detectChanges();
    component.treeComponent.treeModel.expandAll();
    fixture.detectChanges();

    component.nodeActivationChanged.subscribe((event) => {
      if (event.newState) {
        activatedNodes.push(event.node);
      } else {
        let nodeIndex: number = activatedNodes.indexOf(event.node)
        activatedNodes.splice(nodeIndex, 1);
      }
    });

    const brownRiceNode: HTMLElement = fixture.debugElement.query(By.css('#node5')).nativeElement;
    const persianRiceNode: HTMLElement = fixture.debugElement.query(By.css('#node6')).nativeElement;

    brownRiceNode.click();
    persianRiceNode.click();
    fixture.detectChanges();
    brownRiceNode.click();
    persianRiceNode.click();
    fixture.detectChanges();

    expect(activatedNodes.find(node => node.data.id === 1)).toBeFalsy();
    expect(activatedNodes.find(node => node.data.id === 2)).toBeFalsy();
    expect(activatedNodes.find(node => node.data.id === 3)).toBeFalsy();
    expect(activatedNodes.find(node => node.data.id === 4)).toBeFalsy();
    expect(activatedNodes.find(node => node.data.id === 5)).toBeFalsy();
    expect(activatedNodes.find(node => node.data.id === 6)).toBeFalsy();

    expect(fixture.debugElement.query(By.css('#node1 > input')).nativeElement.checked).toBeFalsy();
    expect(fixture.debugElement.query(By.css('#node2 > input')).nativeElement.checked).toBeFalsy();
    expect(fixture.debugElement.query(By.css('#node3 > input')).nativeElement.checked).toBeFalsy();
    expect(fixture.debugElement.query(By.css('#node4 > input')).nativeElement.checked).toBeFalsy();
    expect(fixture.debugElement.query(By.css('#node5 > input')).nativeElement.checked).toBeFalsy();
    expect(fixture.debugElement.query(By.css('#node6 > input')).nativeElement.checked).toBeFalsy();

    const riceParentInput: HTMLInputElement = fixture.debugElement.query(By.css('#node1 > input')).nativeElement;
    expect(riceParentInput.indeterminate).toBe(false);
  });

  it('the component should obey to the initial state of the nodes', () => {
    let activatedNodes: TreeNode[] = [];

    component.nodeActivationChanged.subscribe((event) => {
      if (event.newState) {
        activatedNodes.push(event.node);
      } else {
        let nodeIndex: number = activatedNodes.indexOf(event.node)
        activatedNodes.splice(nodeIndex, 1);
      }
    });

    component.source = trueRootNodes;
    fixture.detectChanges();
    component.treeComponent.treeModel.expandAll();
    fixture.detectChanges();
    component.ngAfterViewInit();
    fixture.detectChanges();

    expect(activatedNodes.find(node => node.data.id === 1)).toBeTruthy();
    expect(activatedNodes.find(node => node.data.id === 2)).toBeTruthy();
    expect(activatedNodes.find(node => node.data.id === 3)).toBeTruthy();
    expect(activatedNodes.find(node => node.data.id === 4)).toBeTruthy();
    expect(activatedNodes.find(node => node.data.id === 5)).toBeTruthy();
    expect(activatedNodes.find(node => node.data.id === 6)).toBeTruthy();

    expect(fixture.debugElement.query(By.css('#node1 > input')).nativeElement.checked).toBeTruthy();
    expect(fixture.debugElement.query(By.css('#node2 > input')).nativeElement.checked).toBeTruthy();
    expect(fixture.debugElement.query(By.css('#node3 > input')).nativeElement.checked).toBeTruthy();
    expect(fixture.debugElement.query(By.css('#node4 > input')).nativeElement.checked).toBeTruthy();
    expect(fixture.debugElement.query(By.css('#node5 > input')).nativeElement.checked).toBeTruthy();
    expect(fixture.debugElement.query(By.css('#node6 > input')).nativeElement.checked).toBeTruthy();
  });
});
