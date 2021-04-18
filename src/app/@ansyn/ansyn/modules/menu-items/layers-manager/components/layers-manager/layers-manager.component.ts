import { Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { map, tap } from 'rxjs/operators';
import { ILayer } from '../../models/layers.model';
import {
	selectIsErrorFetchStaticLayers,
	selectStaticLayer,
	selectStaticLayersLoading
} from '../../reducers/layers.reducer';
import { RefreshStaticLayers } from '../../actions/layers.actions';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { OnDestroy } from '@angular/core';
import { OnInit } from '@angular/core';

@Component({
	selector: 'ansyn-layer-managers',
	templateUrl: './layers-manager.component.html',
	styleUrls: ['./layers-manager.component.less'],
})
@AutoSubscriptions()
export class LayersManagerComponent implements OnInit, OnDestroy{
	loadingLayers: boolean;
	loadingError: boolean;
	staticLayersSize = this.store$.pipe(select(selectStaticLayer), map( (layers: ILayer[]) => layers.length));

	@AutoSubscription
	isStaticLayersLoad = this.store$.pipe(
		select(selectStaticLayersLoading),
		tap( (load) => this.loadingLayers = load)
	);

	@AutoSubscription
	isStaticLayersError = this.store$.pipe(
		select(selectIsErrorFetchStaticLayers),
		tap( (error) => this.loadingError = error)
	);

	constructor(protected store$: Store) {
	}

	refreshStaticLayers() {
		this.store$.dispatch(new RefreshStaticLayers());
	}

	ngOnInit(): void {
	}
	ngOnDestroy(): void {
	}

}
