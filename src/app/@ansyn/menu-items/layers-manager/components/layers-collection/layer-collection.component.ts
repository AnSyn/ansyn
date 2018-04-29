import { ToggleDisplayAnnotationsLayer } from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { ILayerState, layersStateSelector } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { ILayerTreeNode } from '@ansyn/menu-items/layers-manager/models/layer-tree-node';
import { Observable } from 'rxjs/Observable';
import { EnumFilterMetadata } from '@ansyn/menu-items/filters/models/metadata/enum-filter-metadata';
import { NodeActivationChangedEventArgs } from '@ansyn/menu-items/layers-manager/event-args/node-activation-changed-event-args';
import { TreeNode } from 'angular-tree-component';
import { Layer } from '@ansyn/menu-items/layers-manager/services/data-layers.service';

@Component({
	selector: 'ansyn-layer-collection',
	templateUrl: './layer-collection.component.html',
	styleUrls: ['./layer-collection.component.less']
})

export class LayerCollectionComponent implements OnInit {
	@Input() source$: Observable<Layer[]>;
	@Output() public nodeActivationChanged = new EventEmitter<NodeActivationChangedEventArgs>();

	public annotationLayerChecked;

	constructor(public store: Store<ILayerState>) {
	}

	ngOnInit() {
		this.store.select<ILayerState>(layersStateSelector)
			.pluck<ILayerState, boolean>('displayAnnotationsLayer')
			.subscribe(result => {
				this.annotationLayerChecked = result;
			});
	}

	annotationLayerClick() {
		this.store.dispatch(new ToggleDisplayAnnotationsLayer(!this.annotationLayerChecked));
	}

	public onCheckboxClicked(event, layer: Layer): void {
		let newCheckValue: boolean = !layer.isChecked;

		layer.isChecked = newCheckValue;
		this.nodeActivationChanged.emit(new NodeActivationChangedEventArgs(layer, newCheckValue));
	}
	//
	// onInputClicked(key: string) {
	// 	const clonedMetadata: EnumFilterMetadata = Object.assign(Object.create(this.metadata), this.metadata);
	// 	clonedMetadata.updateMetadata(key);
	//
	// 	this.onMetadataChange.emit(clonedMetadata);
	// }
	//
	// selectOnly(key: any) {
	// 	const clonedMetadata: EnumFilterMetadata = Object.assign(Object.create(this.metadata), this.metadata);
	// 	clonedMetadata.selectOnly(key);
	//
	// 	this.onMetadataChange.emit(clonedMetadata);
	// }
}
