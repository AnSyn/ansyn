import { Component, OnDestroy, OnInit } from '@angular/core';
import { ILayer, LayerSearchTypeEnum, LayerType } from '../../models/layers.model';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';
import { selectLayerSearchType, selectStaticLayer } from '../../reducers/layers.reducer';
import { AddLayer, SetLayerSearchType } from '../../actions/layers.actions';

@Component({
	selector: 'ansyn-layers-search',
	templateUrl: './layers-search.component.html',
	styleUrls: ['./layers-search.component.less']
})
@AutoSubscriptions()
export class LayersSearchComponent implements OnInit, OnDestroy {
	lastValue: string;
	layers: ILayer[];
	allStaticLayers: ILayer[];
	layerSearchType: LayerSearchTypeEnum;

	@AutoSubscription
	layerSearchTypeChange$: Observable<LayerSearchTypeEnum> = this.store.pipe(
		select(selectLayerSearchType),
		tap((layerSearchType) => this.layerSearchType = layerSearchType)
	);
	@AutoSubscription
	allLayers$ = this.store.pipe(
		select(selectStaticLayer),
		tap((layers) => this.allStaticLayers = layers)
	);

	get LayerSearchTypes() {
		return LayerSearchTypeEnum;
	}

	constructor(private store: Store) {
	}

	addLayer(layer: ILayer) {
		this.store.dispatch(new AddLayer({ ...layer, type: LayerType.static }));
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}

	changeSearchType(searchType: LayerSearchTypeEnum) {
		if (searchType === this.layerSearchType) {
			this.store.dispatch(new SetLayerSearchType(this.LayerSearchTypes.mapView))
		} else {
			this.store.dispatch(new SetLayerSearchType(searchType));
		}
	}

	getAllLayers() {
		return Boolean(this.lastValue) ? this.getAllLayersByValue(this.lastValue) : this.allStaticLayers;
	}


	getAllLayersByValue(value: string) {
		this.lastValue = value;
		return this.allStaticLayers.filter((layer) => layer.name.toLowerCase().includes(value?.toLowerCase()))
	}

}
