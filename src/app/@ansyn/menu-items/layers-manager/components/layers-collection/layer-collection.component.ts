import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { ILayerState } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Layer } from '@ansyn/menu-items/layers-manager/models/layers.model';
import {
	SelectLayerAction,
	UnselectLayerAction,
	UpdateSelectedLayersToCaseAction
} from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { selectedLayersIds } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs/Observable';

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
	@Input() collection: Layer[];
	_selectedLayers = [];
	selectedLayers$: Observable<any> = this.store.select(selectedLayersIds)
		.distinctUntilChanged()
		.do((selectedLayers) => {
			this._selectedLayers = selectedLayers;
			this.collectionWithIsChecked = this.collectionWithIsChecked.map((layer) => {
				return { ...layer, isChecked: this._selectedLayers.includes(layer.id) };
			});
		});

	public show = true;
	subscribers = [];
	collectionWithIsChecked: any[];


	ngOnInit() {

		this.collectionWithIsChecked = cloneDeep(this.collection);

		this.subscribers.push(
			this.selectedLayers$.subscribe()
		);
	}

	constructor(public store: Store<ILayerState>) {
	}

	public onCheckboxClicked(event, layersContainer: Layer): void {
		if (event.target.checked) {
			this.store.dispatch(new SelectLayerAction(layersContainer));
		} else {
			this.store.dispatch(new UnselectLayerAction(layersContainer));
		}
		this.collectionWithIsChecked = this.collectionWithIsChecked.map((layer) => {
			if (layer.id === layersContainer.id) {
				return { ...layer, isChecked: event.target.checked };
			}
			return layer;
		});
		this.store.dispatch(new UpdateSelectedLayersToCaseAction(this.collectionWithIsChecked
			.filter((layer) => layer.isChecked)
			.map((layer) => layer.id)));
	}
}
