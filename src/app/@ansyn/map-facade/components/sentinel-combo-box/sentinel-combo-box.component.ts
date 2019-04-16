import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store, createSelector, createFeatureSelector } from '@ngrx/store';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { tap } from 'rxjs/operators';

// @todo remove and imports selectors
const sentinelFeature = createFeatureSelector('sentinel');
const selectSentinelLayers = createSelector(sentinelFeature, (sentinel: any) => sentinel && sentinel.layers);
const selectSentinelselectedLayers = createSelector(sentinelFeature, (sentinel: any) => sentinel && sentinel.selectedLayers);
class SetSentinelLayerOnMap {
	type = '[Sentinel] SET_LAYER_ON_MAP';
	constructor(public payload) {
	}
}

@Component({
	selector: 'ansyn-sentinel-combo-box',
	templateUrl: './sentinel-combo-box.component.html',
	styleUrls: ['./sentinel-combo-box.component.less']
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class SentinelComboBoxComponent implements OnInit, OnDestroy {
	sentinelLayers: any[]; // @todo // ISentinelLayer[];
	selectedLayer: string;
	@Input() mapId: string;

	@AutoSubscription
	getLayers$ = this.store.select(selectSentinelLayers).pipe(
		tap((layers: Array<any /* @todo ISentinelLayer */>) => {
			this.sentinelLayers = layers;
		})
	);
	@AutoSubscription
	getLayer$ = this.store.select(selectSentinelselectedLayers).pipe(
		tap((selectedLayers) => {
			this.selectedLayer = selectedLayers[this.mapId] ? selectedLayers[this.mapId] : selectedLayers.defaultLayer;
		})
	);

	constructor(protected store: Store<any>) {

	}

	changeLayer(layer) {
		this.store.dispatch(new SetSentinelLayerOnMap({ id: this.mapId, layer }))
	}

	ngOnInit(): void {
	};

	ngOnDestroy(): void {
	};

}
