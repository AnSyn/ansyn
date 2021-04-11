import { Component, ViewEncapsulation } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { map, share } from 'rxjs/operators';
import { ILayer } from '../../models/layers.model';
import {
	selectIsErrorFetchStaticLayers,
	selectStaticLayer,
	selectStaticLayersLoading
} from '../../reducers/layers.reducer';
import { RefreshStaticLayers } from '../../actions/layers.actions';

@Component({
	selector: 'ansyn-layer-managers',
	templateUrl: './layers-manager.component.html',
	styleUrls: ['./layers-manager.component.less'],
})

export class LayersManagerComponent {

	isStaticLayersLoad = this.store$.pipe(select(selectStaticLayersLoading), share());
	isStaticLayersError = this.store$.pipe(select(selectIsErrorFetchStaticLayers));
	staticLayersSize = this.store$.pipe(select(selectStaticLayer), map( (layers: ILayer[]) => layers.length));

	constructor(protected store$: Store) {
	}

	refreshStaticLayers() {
		this.store$.dispatch(new RefreshStaticLayers());
	}

}
