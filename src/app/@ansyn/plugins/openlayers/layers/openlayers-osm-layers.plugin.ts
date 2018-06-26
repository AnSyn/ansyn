import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { EntitiesVisualizer } from '@ansyn/plugins/openlayers/visualizers/entities-visualizer';
import { Store } from '@ngrx/store';
import { ImageryPlugin } from '@ansyn/imagery/model/base-imagery-plugin';
import { Observable } from 'rxjs';
import { selectSelectedLayersIds } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { tap } from 'rxjs/operators';


@ImageryPlugin({
	supported: [OpenLayersMap],
	deps: [Store]
})
export class OpenlayersOsmLayersPlugin extends EntitiesVisualizer {

	subscribers = [];

	geoFilter$: Observable<any> = this.store$.select(selectSelectedLayersIds)
		.pipe(
			tap((layersIds) => console.log('Hi from plugin ' + layersIds))
		);

	constructor(protected store$: Store<any>) {
		super();
	}

	onInit() {
		this.subscribers.push(
			this.geoFilter$.subscribe()
		);
	}
}
