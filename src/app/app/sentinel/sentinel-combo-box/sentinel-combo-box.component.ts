import { Component, Input, OnDestroy, OnInit, HostBinding } from '@angular/core';
import { Store } from '@ngrx/store';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { tap } from 'rxjs/operators';
import { IEntryComponent } from '@ansyn/map-facade';
import { ISentinelLayer, selectSentinelLayers, selectSentinelselectedLayers } from '../reducers/sentinel.reducer';
import { SetSentinelLayerOnMap } from '../actions/sentinel.actions';
import { get as _get } from 'lodash';
import { ICaseMapState } from '@ansyn/ansyn';
import { SentinelOverlaySourceType } from '../sentinel-source-provider';

@Component({
	selector: 'ansyn-sentinel-combo-box',
	templateUrl: './sentinel-combo-box.component.html',
	styleUrls: ['./sentinel-combo-box.component.less']
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class SentinelComboBoxComponent implements OnInit, OnDestroy, IEntryComponent {
	@Input() mapState: ICaseMapState;

	@HostBinding('hidden')
	get hidden() {
		return _get( this.mapState, 'data.overlay.sourceType') !== SentinelOverlaySourceType
	}

	sentinelLayers: ISentinelLayer[];
	selectedLayer: string;

	@AutoSubscription
	getLayers$ = this.store.select(selectSentinelLayers).pipe(
		tap((layers: Array<ISentinelLayer>) => {
			this.sentinelLayers = layers;
		})
	);
	@AutoSubscription
	getLayer$ = this.store.select(selectSentinelselectedLayers).pipe(
		tap((selectedLayers) => {
			this.selectedLayer = selectedLayers[this.mapState.id] ? selectedLayers[this.mapState.id] : selectedLayers.defaultLayer;
		})
	);

	constructor(protected store: Store<any>) {

	}

	changeLayer(layer) {
		this.store.dispatch(new SetSentinelLayerOnMap({ id: this.mapState.id, layer }));
	}

	ngOnInit(): void {
	};

	ngOnDestroy(): void {
	};

}
