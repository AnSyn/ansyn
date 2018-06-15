import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { ILayerState } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { LayersContainer } from '@ansyn/menu-items/layers-manager/models/layers.model';
import { SelectLayerAction, UnselectLayerAction, UpdateSelectedLayersFromCaseAction, UpdateSelectedLayersToCaseAction } from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { selectedLayersIds } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { cloneDeep } from 'lodash';
import { DataLayersService } from '@ansyn/menu-items/layers-manager/services/data-layers.service';
import { ImageryProviderService } from '@ansyn/imagery/provider-service/imagery-provider.service';
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

export class LayerCollectionComponent implements OnInit{
	@Input() collection: LayersContainer[];
	_selectedLayers = [];
	selectedLayers$: Observable<any> = this.store.select(selectedLayersIds)
	.distinctUntilChanged()
	.do((selectedLayers) => {
		this._selectedLayers = selectedLayers;
		this.collectionWithIsChecked = this.collectionWithIsChecked.map((layer) => {
			return { ...layer, isChecked: this._selectedLayers.includes(layer.id)}
		})
	});

	public show = true;
	subscribers = [];
	collectionWithIsChecked: any[];
	_allLayers = [];


	ngOnInit() {
		this.dataLayersService.getAllLayersInATree().subscribe((layersContainers) => this._allLayers = layersContainers);

		this.collectionWithIsChecked = cloneDeep(this.collection);

		this.subscribers.push(
			this.selectedLayers$.subscribe()
		);
	}

	constructor(public store: Store<ILayerState>,
				protected dataLayersService: DataLayersService,
				protected imageryProviderService: ImageryProviderService) {
	}

	public onCheckboxClicked(event, layersContainer: LayersContainer): void {
		if (event.target.checked) {
			this.store.dispatch(new SelectLayerAction(this._allLayers.find(layer => layer.id === layersContainer.id)))
		} else {
			this.store.dispatch(new UnselectLayerAction(this._allLayers.find(layer => layer.id === layersContainer.id)))
		}
		this.collectionWithIsChecked = this.collectionWithIsChecked.map((layer) => {
			if (layer.id === layersContainer.id) {
				return { ...layer, isChecked: event.target.checked }
			}
			return layer;
		});
		this.store.dispatch(new UpdateSelectedLayersToCaseAction(this.collectionWithIsChecked
			.filter((layer) => layer.isChecked)
			.map((layer) => layer.id)));
	}
}
