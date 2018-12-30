import { Store } from '@ngrx/store';
import { ILayer, layerPluginType, selectLayers, selectSelectedLayersIds } from '@ansyn/menu-items';
import OSM from 'ol/source/osm';
import TileLayer from 'ol/layer/tile';
import { filter, map, tap } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { BaseImageryPlugin, ImageryPlugin } from '@ansyn/imagery';
import { MapFacadeService, selectMapsList } from '@ansyn/map-facade';
import { ICaseMapState } from '@ansyn/core';
import { debounceTime, distinctUntilChanged } from 'rxjs/internal/operators';
import { AutoSubscription } from 'auto-subscriptions';
import { OpenLayersMap } from '../../maps/open-layers-map/openlayers-map/openlayers-map';


@ImageryPlugin({
	supported: [OpenLayersMap],
	deps: [Store]
})
export class OpenlayersOsmLayersPlugin extends BaseImageryPlugin {

	@AutoSubscription
	toggleGroup$ = this.store$.select(selectMapsList).pipe(
		map((mapsList) => MapFacadeService.mapById(mapsList, this.mapId)),
		filter(Boolean),
		map((map: ICaseMapState) => !map.flags.displayLayers),
		distinctUntilChanged(),
		debounceTime(50),
		tap((newState: boolean) => this.iMap.toggleGroup('layers', newState))
	);

	@AutoSubscription
	osmLayersChanges$: Observable<any[]> = combineLatest(this.store$.select(selectLayers), this.store$.select(selectSelectedLayersIds))
		.pipe(
			tap(([result, selectedLayerId]: [ILayer[], string[]]) => {
				result.filter(this.isOSMlayer)
					.forEach((layer: ILayer) => {
						if (selectedLayerId.includes(layer.id)) {
							this.addGroupLayer(layer);
						} else {
							this.removeGroupLayer(layer.id);
						}
					});
			})
		);

	constructor(protected store$: Store<any>) {
		super();
	}

	isOSMlayer(layer: ILayer) {
		return layer.layerPluginType === layerPluginType.OSM;
	}

	createOSMLayer(layer: ILayer): TileLayer {
		const vector = new TileLayer({
			zIndex: 100,
			source: new OSM({
				attributions: [
					layer.name
				],
				opaque: false,
				url: layer.url,
				crossOrigin: null
			})
		});
		vector.set('id', layer.id);
		return vector;
	}

	addGroupLayer(layer: ILayer) {
		const group = OpenLayersMap.groupLayers.get(OpenLayersMap.groupsKeys.layers);
		const layersArray = group.getLayers().getArray();
		if (!layersArray.some((shownLayer) => shownLayer.get('id') === layer.id)) {
			const osmLayer = this.createOSMLayer(layer);
			group.getLayers().push(osmLayer);
		}
	}

	removeGroupLayer(id: string): void {
		const group = OpenLayersMap.groupLayers.get(OpenLayersMap.groupsKeys.layers);
		const layersArray: any[] = group.getLayers().getArray();
		let removeIdx = layersArray.indexOf(layersArray.find(l => l.get('id') === id));
		if (removeIdx >= 0) {
			group.getLayers().removeAt(removeIdx);
		}
	}

}
