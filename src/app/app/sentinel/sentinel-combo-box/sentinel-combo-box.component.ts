import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
	ISentinelLayer,
	ISentinelState,
	selectSentinelLayers,
	selectSentinelselectedLayers
} from "../reducers/sentinel.reducer";
import { Store } from '@ngrx/store';
import { SetSentinelLayerOnMap } from "../actions/sentinel.actions";
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { tap } from 'rxjs/operators';

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
	SELECTEDLAYERS: ISentinelLayer[];
	selectedLayer: string;
	@Input() mapId: string;

	@AutoSubscription
	getLayers$ = this.store.select(selectSentinelLayers).pipe(
		tap((layers: Array<ISentinelLayer>) => {
			this.SELECTEDLAYERS = layers;
		})
	);
	@AutoSubscription
	getLayer$ = this.store.select(selectSentinelselectedLayers).pipe(
		tap((selectedLayers) => {
			this.selectedLayer = selectedLayers[this.mapId] ? selectedLayers[this.mapId] : selectedLayers.defaultLayer;
		})
	);

	constructor(protected store: Store<ISentinelState>) {

	}

	changeLayer(layer) {
		this.store.dispatch(new SetSentinelLayerOnMap({ id: this.mapId, layer }))
	}

	ngOnInit(): void {
	};

	ngOnDestroy(): void {
	};

}
