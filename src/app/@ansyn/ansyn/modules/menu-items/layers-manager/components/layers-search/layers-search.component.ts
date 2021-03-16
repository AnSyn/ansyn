import { Component, OnDestroy, OnInit } from '@angular/core';
import { ILayer, LayerSearchTypeEnum, LayerType } from '../../models/layers.model';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
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
	layers: ILayer[];
	layerSearchType: LayerSearchTypeEnum;

	@AutoSubscription
	layerSearchTypeChange$: Observable<LayerSearchTypeEnum> = this.store.pipe(
		select(selectLayerSearchType),
		tap((layerSearchType) => this.layerSearchType = layerSearchType)
	);

	allLayers$ = this.store.pipe(
		select(selectStaticLayer),
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

	getAllLayersByValue(value: string) {
		return this.allLayers$.pipe(
			map( (layers) => layers.filter((layer) => layer.name.toLowerCase().includes(value?.toLowerCase())))
		)
	}

}
