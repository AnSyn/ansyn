import { layersConfig } from '@ansyn/menu-items/layers-manager/services/data-layers.service';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LayerTreeComponent } from './layer-tree.component';
import { LayersManagerModule } from '../../layers-manager.module';
import { ILayerTreeNode } from '../../models/layer-tree-node';
import { TreeNode } from 'angular-tree-component';
import { Observable } from 'rxjs/Observable';
import { Store, StoreModule } from '@ngrx/store';
import { ILayerState, layersFeatureKey, LayersReducer } from '../../reducers/layers.reducer';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { CoreModule } from '@ansyn/core/core.module';
import { Subject } from 'rxjs/Subject';
import { LoggerService } from '@ansyn/core/services/logger.service';
import { ToggleDisplayAnnotationsLayer } from '../../actions/layers.actions';
import { CoreConfig } from '@ansyn/core/models/core.config';

export function flattenNodeTree(rootNode: ILayerTreeNode, flattenedArray: ILayerTreeNode[] = []): ILayerTreeNode[] {
	flattenedArray.push(rootNode);
	rootNode.children.forEach((child: ILayerTreeNode) => flattenNodeTree(child, flattenedArray));
	return flattenedArray;
}

describe('LayerTreeComponent', () => {
	let component: LayerTreeComponent;
	let fixture: ComponentFixture<LayerTreeComponent>;
	let store: Store<ILayerState>;
	let handler: Subject<any>;



	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				LayersManagerModule,
				CoreModule,
				HttpClientModule,
				EffectsModule.forRoot([]),
				StoreModule.forRoot({ [layersFeatureKey]: LayersReducer })
			],
			providers: [
				{ provide: layersConfig, useValue: { schema: null } },
				{ provide: LoggerService, useValue: { error: (some) => null } },
				{ provide: CoreConfig, useValue: {} }
			]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<ILayerState>) => {
		store = _store;
		handler = new Subject();
		spyOn(store, 'select').and.returnValue(handler);
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(LayerTreeComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});


	describe('Check onInit subscribers', () => {


		it('listen to ILayerState changes', () => {
			component.annotationLayerChecked = false;
			handler.next({
				displayAnnotationsLayer: true,
				layers: [],
				selectedLayers: []
			});
			expect(component.annotationLayerChecked).toBe(true);

			handler.next({
				displayAnnotationsLayer: false,
				layers: [],
				selectedLayers: []
			});
			expect(component.annotationLayerChecked).toBe(false);
		});
	});

	it('annotation layer checkbox click - state: annotation layer disabled', () => {
		spyOn(store, 'dispatch');
		component.annotationLayerChecked = false;
		component.annotationLayerClick();
		expect(store.dispatch).toHaveBeenCalledWith(new ToggleDisplayAnnotationsLayer(true));
	});

	it('annotation layer checkbox click - state: annotation layer enabled', () => {
		spyOn(store, 'dispatch');
		component.annotationLayerChecked = true;
		component.annotationLayerClick();
		expect(store.dispatch).toHaveBeenCalledWith(new ToggleDisplayAnnotationsLayer(false));
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize treeview after nodes was assigned', () => {
		let allFalseNodes: ILayerTreeNode[] = [{
			name: 'Fields',
			id: '1',
			isChecked: false,
			isIndeterminate: false,
			children: [
				{
					name: 'Rice Fields', id: '2', isChecked: false, isIndeterminate: false, children: [
					{ name: 'Brown Rice', id: '5', isChecked: false, isIndeterminate: false, children: [] },
					{ name: 'Persian Rice', id: '6', isChecked: false, isIndeterminate: false, children: [] }]
				},
				{ name: 'Wheat Fields', id: '3', isChecked: false, isIndeterminate: false, children: [] },
				{ name: 'Oat Fields', id: '4', isChecked: false, isIndeterminate: false, children: [] }
			]
		}];

		component.source$ = Observable.of(allFalseNodes);
		fixture.detectChanges();
		component.ngAfterViewInit();
		fixture.detectChanges();
		component.treeComponent.treeModel.expandAll();
		fixture.detectChanges();
		component.treeComponent.treeModel.getNodeBy(node => node.data.id === '2').expand();
		fixture.detectChanges();

		const allSpans: Array<any> = Array.from(fixture.nativeElement.querySelectorAll('span.title'));
		const allNodes: ILayerTreeNode[] = flattenNodeTree(allFalseNodes[0]);

		expect(allSpans.length).toEqual(allNodes.length);
		expect(allSpans.map(span => span.textContent)).toEqual(allNodes.map(node => node.name));
	});

	it('selection in the root should bubble to its children', () => {
		let activatedNodes: TreeNode[] = [];
		let allFalseNodes: ILayerTreeNode[] = [{
			name: 'Fields',
			id: '1',
			isChecked: false,
			isIndeterminate: false,
			children: [
				{
					name: 'Rice Fields', id: '2', isChecked: false, isIndeterminate: false, children: [
					{ name: 'Brown Rice', id: '5', isChecked: false, isIndeterminate: false, children: [] },
					{ name: 'Persian Rice', id: '6', isChecked: false, isIndeterminate: false, children: [] }]
				},
				{ name: 'Wheat Fields', id: '3', isChecked: false, isIndeterminate: false, children: [] },
				{ name: 'Oat Fields', id: '4', isChecked: false, isIndeterminate: false, children: [] }
			]
		}];

		component.source$ = Observable.of(allFalseNodes);
		fixture.detectChanges();
		component.ngAfterViewInit();
		fixture.detectChanges();
		component.treeComponent.treeModel.expandAll();
		fixture.detectChanges();
		component.treeComponent.treeModel.getNodeBy(node => node.data.id === '2').expand();
		fixture.detectChanges();

		component.nodeActivationChanged.subscribe((event) => {
			if (event.newState) {
				activatedNodes.push(event.node);
			} else {
				let nodeIndex: number = activatedNodes.indexOf(event.node);
				activatedNodes.splice(nodeIndex, 1);
			}
		});

		const rootDiv = fixture.debugElement.query(By.css('#node' + allFalseNodes[0].id)).nativeElement;

		rootDiv.click();
		fixture.detectChanges();

		expect(activatedNodes.find(node => node.id === '1')).toBeFalsy();
		expect(activatedNodes.find(node => node.id === '2')).toBeFalsy();
		expect(activatedNodes.find(node => node.id === '3')).toBeTruthy();
		expect(activatedNodes.find(node => node.id === '4')).toBeTruthy();
		expect(activatedNodes.find(node => node.id === '5')).toBeTruthy();
		expect(activatedNodes.find(node => node.id === '6')).toBeTruthy();

		expect(fixture.debugElement.query(By.css('#node1 > input')).nativeElement.checked).toBeTruthy();
		expect(fixture.debugElement.query(By.css('#node2 > input')).nativeElement.checked).toBeTruthy();
		expect(fixture.debugElement.query(By.css('#node3 > input')).nativeElement.checked).toBeTruthy();
		expect(fixture.debugElement.query(By.css('#node4 > input')).nativeElement.checked).toBeTruthy();
		expect(fixture.debugElement.query(By.css('#node5 > input')).nativeElement.checked).toBeTruthy();
		expect(fixture.debugElement.query(By.css('#node6 > input')).nativeElement.checked).toBeTruthy();
	});

	it('selection in sub children should select the parent, and set indeterminate in the grandparent', () => {
		let activatedNodes: TreeNode[] = [];
		let allFalseNodes: ILayerTreeNode[] = [{
			name: 'Fields',
			id: '1',
			isChecked: false,
			isIndeterminate: false,
			children: [
				{
					name: 'Rice Fields', id: '2', isChecked: false, isIndeterminate: false, children: [
					{ name: 'Brown Rice', id: '5', isChecked: false, isIndeterminate: false, children: [] },
					{ name: 'Persian Rice', id: '6', isChecked: false, isIndeterminate: false, children: [] }]
				},
				{ name: 'Wheat Fields', id: '3', isChecked: false, isIndeterminate: false, children: [] },
				{ name: 'Oat Fields', id: '4', isChecked: false, isIndeterminate: false, children: [] }
			]
		}];

		component.source$ = Observable.of(allFalseNodes);
		fixture.detectChanges();
		component.ngAfterViewInit();
		fixture.detectChanges();
		component.treeComponent.treeModel.expandAll();
		fixture.detectChanges();
		component.treeComponent.treeModel.getNodeBy(node => node.data.id === '2').expand();
		fixture.detectChanges();

		component.nodeActivationChanged.subscribe((event) => {
			if (event.newState) {
				activatedNodes.push(event.node);
			} else {
				let nodeIndex: number = activatedNodes.indexOf(event.node);
				activatedNodes.splice(nodeIndex, 1);
			}
		});

		const brownRiceNode = fixture.debugElement.query(By.css('#node5')).nativeElement;
		const persianRiceNode = fixture.debugElement.query(By.css('#node6')).nativeElement;

		brownRiceNode.click();
		persianRiceNode.click();
		fixture.detectChanges();
		fixture.detectChanges();
		fixture.detectChanges();

		expect(activatedNodes.find(node => node.id === '1')).toBeFalsy();
		expect(activatedNodes.find(node => node.id === '2')).toBeFalsy();
		expect(activatedNodes.find(node => node.id === '3')).toBeFalsy();
		expect(activatedNodes.find(node => node.id === '4')).toBeFalsy();
		expect(activatedNodes.find(node => node.id === '5')).toBeTruthy();
		expect(activatedNodes.find(node => node.id === '6')).toBeTruthy();

		expect(fixture.debugElement.query(By.css('#node1 > input')).nativeElement.checked).toBeFalsy();
		expect(fixture.debugElement.query(By.css('#node2 > input')).nativeElement.checked).toBeTruthy();
		expect(fixture.debugElement.query(By.css('#node3 > input')).nativeElement.checked).toBeFalsy();
		expect(fixture.debugElement.query(By.css('#node4 > input')).nativeElement.checked).toBeFalsy();
		expect(fixture.debugElement.query(By.css('#node5 > input')).nativeElement.checked).toBeTruthy();
		expect(fixture.debugElement.query(By.css('#node6 > input')).nativeElement.checked).toBeTruthy();

		const riceParentInput = fixture.debugElement.query(By.css('#node1 > input')).nativeElement;
		expect(riceParentInput.indeterminate).toBe(true);
	});

	it('selection and unselection in sub children should return to the initial state', () => {
		let activatedNodes: TreeNode[] = [];
		let allFalseNodes: ILayerTreeNode[] = [{
			name: 'Fields',
			id: '1',
			isChecked: false,
			isIndeterminate: false,
			children: [
				{
					name: 'Rice Fields', id: '2', isChecked: false, isIndeterminate: false, children: [
					{ name: 'Brown Rice', id: '5', isChecked: false, isIndeterminate: false, children: [] },
					{ name: 'Persian Rice', id: '6', isChecked: false, isIndeterminate: false, children: [] }]
				},
				{ name: 'Wheat Fields', id: '3', isChecked: false, isIndeterminate: false, children: [] },
				{ name: 'Oat Fields', id: '4', isChecked: false, isIndeterminate: false, children: [] }
			]
		}];

		component.source$ = Observable.of(allFalseNodes);
		fixture.detectChanges();
		component.ngAfterViewInit();
		fixture.detectChanges();
		component.treeComponent.treeModel.expandAll();
		fixture.detectChanges();
		component.treeComponent.treeModel.getNodeBy(node => node.data.id === '2').expand();
		fixture.detectChanges();

		component.nodeActivationChanged.subscribe((event) => {
			if (event.newState) {
				activatedNodes.push(event.node);
			} else {
				let nodeIndex: number = activatedNodes.indexOf(event.node);
				activatedNodes.splice(nodeIndex, 1);
			}
		});

		const brownRiceNode = fixture.debugElement.query(By.css('#node5')).nativeElement;
		const persianRiceNode = fixture.debugElement.query(By.css('#node6')).nativeElement;

		brownRiceNode.click();
		persianRiceNode.click();
		fixture.detectChanges();
		fixture.detectChanges();

		brownRiceNode.click();
		persianRiceNode.click();
		fixture.detectChanges();

		expect(activatedNodes.find(node => node.id === '1')).toBeFalsy('activatedNodes.find(node => node.data.id === 1)');
		expect(activatedNodes.find(node => node.id === '2')).toBeFalsy('activatedNodes.find(node => node.data.id === 2)');
		expect(activatedNodes.find(node => node.id === '3')).toBeFalsy('activatedNodes.find(node => node.data.id === 3)');
		expect(activatedNodes.find(node => node.id === '4')).toBeFalsy('activatedNodes.find(node => node.data.id === 4)');
		expect(activatedNodes.find(node => node.id === '5')).toBeFalsy('activatedNodes.find(node => node.data.id === 5)');
		expect(activatedNodes.find(node => node.id === '6')).toBeFalsy('activatedNodes.find(node => node.data.id === 6)');

		expect(fixture.debugElement.query(By.css('#node1 > input')).nativeElement.checked).toBeFalsy('(#node1 > input)).nativeElement.checked');
		expect(fixture.debugElement.query(By.css('#node2 > input')).nativeElement.checked).toBeFalsy('(#node2 > input)).nativeElement.checked');
		expect(fixture.debugElement.query(By.css('#node3 > input')).nativeElement.checked).toBeFalsy('(#node3 > input)).nativeElement.checked');
		expect(fixture.debugElement.query(By.css('#node4 > input')).nativeElement.checked).toBeFalsy('(#node4 > input)).nativeElement.checked');
		expect(fixture.debugElement.query(By.css('#node5 > input')).nativeElement.checked).toBeFalsy('(#node5 > input)).nativeElement.checked');
		expect(fixture.debugElement.query(By.css('#node6 > input')).nativeElement.checked).toBeFalsy('(#node6 > input)).nativeElement.checked');

		const riceParentInput = fixture.debugElement.query(By.css('#node1 > input')).nativeElement;
		expect(riceParentInput.indeterminate).toBe(false);
	});

	it('the component should obey to the initial state of the nodes', () => {
		let activatedNodes: TreeNode[] = [];
		let allTrueNodes: ILayerTreeNode[] = [{
			name: 'Fields',
			id: '1',
			isChecked: true,
			isIndeterminate: false,
			children: [
				{
					name: 'Rice Fields', id: '2', isChecked: true, isIndeterminate: false, children: [
					{ name: 'Brown Rice', id: '5', isChecked: true, isIndeterminate: false, children: [] },
					{ name: 'Persian Rice', id: '6', isChecked: true, isIndeterminate: false, children: [] }]
				},
				{ name: 'Wheat Fields', id: '3', isChecked: true, isIndeterminate: false, children: [] },
				{ name: 'Oat Fields', id: '4', isChecked: true, isIndeterminate: false, children: [] }
			]
		}];

		component.nodeActivationChanged.subscribe((event) => {
			if (event.newState) {
				activatedNodes.push(event.node);
			} else {
				let nodeIndex: number = activatedNodes.indexOf(event.node);
				activatedNodes.splice(nodeIndex, 1);
			}
		});

		component.source$ = Observable.of(allTrueNodes);
		fixture.detectChanges();
		component.ngAfterViewInit();
		fixture.detectChanges();
		component.treeComponent.treeModel.expandAll();
		fixture.detectChanges();
		component.treeComponent.treeModel.getNodeBy(node => node.data.id === '2').expand();
		fixture.detectChanges();

		expect(fixture.debugElement.query(By.css('#node1 > input')).nativeElement.checked).toBeTruthy();
		expect(fixture.debugElement.query(By.css('#node2 > input')).nativeElement.checked).toBeTruthy();
		expect(fixture.debugElement.query(By.css('#node3 > input')).nativeElement.checked).toBeTruthy();
		expect(fixture.debugElement.query(By.css('#node4 > input')).nativeElement.checked).toBeTruthy();
		expect(fixture.debugElement.query(By.css('#node5 > input')).nativeElement.checked).toBeTruthy();
		expect(fixture.debugElement.query(By.css('#node6 > input')).nativeElement.checked).toBeTruthy();
	});
});
