import { Component, Input } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Store } from '@ngrx/store';
import { SetLayersModal, ShowAllLayers } from '../../actions/layers.actions';
import { SelectedModalEnum } from '../../reducers/layers-modal';
import { ILayer, LayerType } from '../../models/layers.model';
import { ILayerState } from '../../reducers/layers.reducer';

export interface ILayerCollection {
	type: LayerType;
	data: ILayer[];
}
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

export class LayerCollectionComponent {
	@Input() collection: ILayerCollection;
	public show = true;

	get SelectedModalEnum() {
		return SelectedModalEnum;
	}

	get LayerType() {
		return LayerType;
	}

	constructor(public store: Store<ILayerState>) {
	}

	showAll() {
		this.store.dispatch(new ShowAllLayers(this.collection.type));
	}

	openModal(type: SelectedModalEnum, layer?: ILayer): void {
		this.store.dispatch(new SetLayersModal({ type, layer }));
	}
}
