import { Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { ILayer, LayerSearchTypeEnum, LayerType } from '../../models/layers.model';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';
import { selectLayerSearchType, selectStaticLayer, selectLayers } from '../../reducers/layers.reducer';
import { AddLayer, SetLayerSearchType } from '../../actions/layers.actions';
import { ILayersManagerConfig } from '../../models/layers-manager-config';
import { layersConfig } from '../../services/data-layers.service';
import { SetToastMessageAction } from '@ansyn/map-facade';

@Component({
	selector: 'ansyn-layers-search',
	templateUrl: './layers-search.component.html',
	styleUrls: ['./layers-search.component.less']
})
@AutoSubscriptions()
export class LayersSearchComponent implements OnInit, OnDestroy {
	layerSearchType: LayerSearchTypeEnum;
	openStaticLayers: number;

	@AutoSubscription
	layerSearchTypeChange$: Observable<LayerSearchTypeEnum> = this.store.pipe(
		select(selectLayerSearchType),
		tap((layerSearchType) => this.layerSearchType = layerSearchType)
	);

	@AutoSubscription
	openStaticLayersCount$: Observable<number> = this.store.pipe(
		select(selectLayers),
		map( (layers: ILayer[]) => layers.filter( layer => layer.type === LayerType.static).length),
		tap( (count) => this.openStaticLayers = count)
	);

	allStaticLayers$ = this.store.pipe(
		select(selectStaticLayer),
	);

	get LayerSearchTypes() {
		return LayerSearchTypeEnum;
	}

	constructor(private store: Store,
				@Inject(layersConfig) protected config: ILayersManagerConfig) {
	}

	addLayer(layer: ILayer) {
		if (this.openStaticLayers >= this.config.limit) {
			this.store.dispatch(new SetToastMessageAction({toastText: this.config.limitError}))
		}
		else {
			this.store.dispatch(new AddLayer({ ...layer, type: LayerType.static }));
		}
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
		return this.allStaticLayers$.pipe(
			map( (layers) => layers.filter((layer) => layer.name.toLowerCase().includes(value?.toLowerCase())))
		)
	}

}
