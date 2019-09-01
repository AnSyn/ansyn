import { Component, Input, OnDestroy, OnInit, HostBinding } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { tap } from 'rxjs/operators';
import { IEntryComponent, selectMaps, selectOverlayFromMap } from '@ansyn/map-facade';
import { ISentinelLayer, selectSentinelLayers, selectSentinelselectedLayers } from '../reducers/sentinel.reducer';
import { SetSentinelLayerOnMap } from '../actions/sentinel.actions';
import { get as _get } from 'lodash';
import { SentinelOverlaySourceType } from '../sentinel-source-provider';
import { IMapSettings } from '@ansyn/imagery';

@Component({
	selector: 'ansyn-sentinel-combo-box',
	templateUrl: './sentinel-combo-box.component.html',
	styleUrls: ['./sentinel-combo-box.component.less']
})
@AutoSubscriptions()
export class SentinelComboBoxComponent implements OnInit, OnDestroy, IEntryComponent {
	@HostBinding('hidden') hidden = true;

	@Input() mapId: string;

	sentinelLayers: ISentinelLayer[];
	selectedLayer: string;

	@AutoSubscription
	mapState$ = () => this.store.pipe(
		select(selectOverlayFromMap(this.mapId)),
		tap((overlay) => {
			this.hidden = _get(overlay, 'sourceType') !== SentinelOverlaySourceType;
		})
	);



	@AutoSubscription
	getLayers$ = this.store.select(selectSentinelLayers).pipe(
		tap((layers: Array<ISentinelLayer>) => {
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
		this.store.dispatch(new SetSentinelLayerOnMap({ id: this.mapId, layer }));
	}

	ngOnInit(): void {
	};

	ngOnDestroy(): void {
	};

	getType(): string {
		return '';
	}

}
