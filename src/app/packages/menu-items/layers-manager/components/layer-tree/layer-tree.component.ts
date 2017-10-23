import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NodeActivationChangedEventArgs } from '../../event-args/node-activation-changed-event-args';
import { TreeActionMappingService } from '../../services/tree-action-mapping.service';
import { TreeComponent, TreeNode } from 'angular-tree-component';
import { ILayerTreeNode } from '../../models/layer-tree-node';
import { Observable } from 'rxjs/Observable';
import { HideAnnotationsLayer, ShowAnnotationsLayer } from '../../actions/layers.actions';
import { ILayerState, layersStateSelector } from '../../reducers/layers.reducer';
import { Store } from '@ngrx/store';

@Component({
	selector: 'ansyn-layer-tree',
	templateUrl: './layer-tree.component.html',
	styleUrls: ['./layer-tree.component.less'],
	providers: [TreeActionMappingService]
})

export class LayerTreeComponent implements OnInit, AfterViewInit {

	public options;
	public annotationLayerChecked = true;

	@ViewChild(TreeComponent) treeComponent: TreeComponent;

	@Input() source: Observable<ILayerTreeNode[]>;

	@Output() public nodeActivationChanged = new EventEmitter<NodeActivationChangedEventArgs>();

	constructor(public store: Store<ILayerState>, public actionMappingService: TreeActionMappingService, public myElement: ElementRef) {
	}

	ngOnInit() {
		this.options = {
			getChildren: () => new Promise((resolve, reject) => {
			}),
			actionMapping: this.actionMappingService.getActionMapping(),
			useVirtualScroll: true,
			nodeHeight: 24
		};

		this.store.select<ILayerState>(layersStateSelector)
			.pluck<ILayerState, boolean>('displayAnnotationsLayer')
			.subscribe(result => {
				this.annotationLayerChecked = result;
			})
	}

	ngAfterViewInit() {
		this.treeComponent.treeModel.virtualScroll.setViewport(this.myElement.nativeElement);
	}

	annotationLayerClick($event, data) {
		this.annotationLayerChecked = !this.annotationLayerChecked;
		if (this.annotationLayerChecked) {
			this.store.dispatch(new ShowAnnotationsLayer({ update: true }))
		} else {
			this.store.dispatch(new HideAnnotationsLayer({ update: true }))
		}
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

		node.data.isChecked = newCheckValue;
		if (node.isLeaf) {
			this.nodeActivationChanged.emit(new NodeActivationChangedEventArgs(node.data, newCheckValue));
		}

		this.bubbleActivationDown(node, newCheckValue);
		this.bubbleActivationUp(parentNode, newCheckValue);
		this.bubbleIndeterminate(node.realParent);
	}

	public bubbleActivationDown(node: TreeNode, activationValue: boolean) {

		node.children.filter(child => child.data.isChecked !== activationValue).forEach(child => {
			child.data.isChecked = activationValue;
			if (child.isLeaf) {
				this.nodeActivationChanged.emit(new NodeActivationChangedEventArgs(child.data, activationValue));
			}
			this.bubbleActivationDown(child, activationValue);
		});

		if (node.isLeaf) {
			this.bubbleIndeterminate(node.realParent);
		}
	}

	public bubbleActivationUp(node: TreeNode, newValue: boolean): void {
		if (!node) {
			return;
		}

		if ((newValue && node.children.every(child => child.data.isChecked === newValue)) ||
			(!newValue && node.children.some(child => child.data.isChecked === newValue))) {
			node.data.isChecked = newValue;
			this.bubbleActivationUp(node.realParent, newValue);
		}
	}

	public bubbleIndeterminate(node: TreeNode): void {
		if (!node) {
			return;
		}
		node.data.isIndeterminate = this.isNodeIndeterminate(node);
		if (node.realParent) {
			this.bubbleIndeterminate(node.realParent);
		}
	}

	public isNodeIndeterminate(node: TreeNode): boolean {
		if (!node.hasChildren) {
			return false;
		}

		return !(node.children.every(child => child.data.isChecked) || node.children.every(child => !child.data.isChecked));
	}
}



