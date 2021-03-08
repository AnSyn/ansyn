import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ILayer, LayerType } from '../../models/layers.model';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { Observable } from 'rxjs';
import { retryWhen, tap } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';
import { selectStaticLayer } from '../../reducers/layers.reducer';
import { AddLayer } from '../../actions/layers.actions';

@Component({
	selector: 'ansyn-layers-search',
	templateUrl: './layers-search.component.html',
	styleUrls: ['./layers-search.component.less']
})
@AutoSubscriptions()
export class LayersSearchComponent implements OnInit, OnDestroy {
	control = new FormControl();
	layers: ILayer[];
	allStaticLayers: ILayer[];

	@AutoSubscription
	allLayers$ = this.store.pipe(
		select(selectStaticLayer),
		tap( (layers) => this.allStaticLayers = layers)
	);

	@AutoSubscription
	filterStaticLayers$: Observable<any> = this.control.valueChanges.pipe(
		tap((value: string) => {
			this.layers = this.allStaticLayers.filter( (layer) => layer.name.toLowerCase().includes(value.toLowerCase()));
		}),
		retryWhen((err) => {
			return err.pipe(
				tap(() => {
					this.layers = [];
				})
			)
		})
	);

	constructor(private store: Store) {
	}

	addLayer(layer: ILayer) {
		this.store.dispatch(new AddLayer({...layer, type: LayerType.static}));
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}

}
