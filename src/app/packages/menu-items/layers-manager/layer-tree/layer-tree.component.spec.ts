import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { LayerTreeComponent } from './layer-tree.component';
import { LayersManagerModule } from '../layers-manager.module';
import { CoreModule } from '../../../core/core.module';
import { ILayerTreeNode } from '../models/layer-tree-node'

fdescribe('LayerTreeComponent', () => {
  let component: LayerTreeComponent;
  let fixture: ComponentFixture<LayerTreeComponent>;
  const nodes: ILayerTreeNode[] = [{
    name: 'Fields',
    id: 1,
    children: [
      {
        name: 'Rice Fields', id: 2, children: [
          { name: 'Brown Rice', id: 5, children: [] },
          { name: 'Persian Rice', id: 6, children: [] }]
      },
      { name: 'Wheat Fields', id: 3, children: [] },
      { name: 'Oat Fields', id: 4, children: [] }
    ]
  }];

  function flattenNodeTree(rootNode: ILayerTreeNode, flattenedArray: ILayerTreeNode[] = []): ILayerTreeNode[] {
    flattenedArray.push(rootNode);

    rootNode.children.forEach((child: ILayerTreeNode) => flattenedArray.concat(flattenNodeTree(child, flattenedArray)));

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
    component.source = nodes;
    fixture.detectChanges();
    component.treeComponent.treeModel.expandAll();
    fixture.detectChanges();

    const allSpans: Array<HTMLSpanElement> = Array.from<HTMLSpanElement>(fixture.nativeElement.querySelectorAll('span.title'));
    const allNodes: ILayerTreeNode[] = flattenNodeTree(nodes[0]);

    expect(allSpans.length).toEqual(allNodes.length);
    expect(allSpans.map(span => span.textContent)).toEqual(allNodes.map(node => node.name));
  });


});
