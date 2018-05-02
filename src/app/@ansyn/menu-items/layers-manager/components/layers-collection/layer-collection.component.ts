import { ToggleDisplayAnnotationsLayer } from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { ILayerState, layersStateSelector } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { Observable } from 'rxjs/Observable';
import { NodeActivationChangedEventArgs } from '@ansyn/menu-items/layers-manager/event-args/node-activation-changed-event-args';
import { Layer } from '@ansyn/menu-items/layers-manager/services/data-layers.service';
import { LayerType } from '@ansyn/menu-items/layers-manager/models/layer-type';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
	selector: 'ansyn-layer-collection',
	templateUrl: './layer-collection.component.html',
	styleUrls: ['./layer-collection.component.less'],
	animations: [
		trigger('rotateArrow', [
			state('true', style({
				transform: 'rotateZ(-45deg) translateY(35%) translateX(50%)'
			})),
			state('false', style({
				transform: 'rotateZ(135deg) translateY(-75%)'
			})),
			transition('1 <=> 0', animate('0.1s'))
		]),
		trigger('layersTrigger', [
			state('true', style({
				maxHeight: '5000px',
				opacity: 1
			})),
			state('false', style({
				maxHeight: '0',
				opacity: 0
			})),
			transition('1 <=> 0', animate('0.2s'))
		])
	]
})

export class LayerCollectionComponent implements OnInit {
	@Input() source$: Observable<Layer[]>;
	@Output() public nodeActivationChanged = new EventEmitter<NodeActivationChangedEventArgs>();
	public type: Observable<LayerType> = this.store.select(layersStateSelector).map((state: ILayerState) => state.layersContainer.type);
	public show = true;

	public annotationLayerChecked;

	constructor(public store: Store<ILayerState>) {
	}

	get disabledButton() {
		return !this.source$ && !this.type;
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
}
