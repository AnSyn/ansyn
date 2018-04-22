import { LayersService } from '../../services/layers.service';
import { Component, OnDestroy } from '@angular/core';
import { Layer } from '../../models/layer';
import { Store } from '@ngrx/store';
import { ILayersState } from '../../reducers/layers.reducer';
import { Observable } from "rxjs/Observable";

@Component({
	selector: 'ansyn-layers',
	templateUrl: './layers-collection.component.html',
	styleUrls: ['./layers-collection.component.less']
})

export class LayersCollectionComponent implements OnDestroy {
	public disableShowOnlyFavoritesSelection: boolean;
	public layers: Observable<Layer[]> = this.layersService.getLayers().map(layersBundle => layersBundle.layers);

	public subscribers = {
		layers: undefined
	} as any;

	constructor(protected layersService: LayersService, public store: Store<ILayersState>) {
	}

	ngOnDestroy() {
		Object.keys(this.subscribers).forEach((s) => this.subscribers[s].unsubscribe());
	}


}
