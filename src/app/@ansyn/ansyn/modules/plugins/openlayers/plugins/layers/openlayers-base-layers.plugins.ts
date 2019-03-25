import { Store } from '@ngrx/store';
import { ILayer, selectLayers, selectSelectedLayersIds } from '../../../../menu-items/public_api';
import TileLayer from 'ol/layer/Tile';
import { filter, map, tap } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { BaseImageryPlugin } from '@ansyn/imagery';
import { MapFacadeService, selectMapsList } from '@ansyn/map-facade';
import { ICaseMapState } from '@ansyn/core';
import { debounceTime, distinctUntilChanged } from 'rxjs/internal/operators';
import { AutoSubscription } from 'auto-subscriptions';
import { OpenLayersMap } from '../../maps/open-layers-map/openlayers-map/openlayers-map';

export abstract class OpenlayersBaseLayersPlugins extends BaseImageryPlugin {

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
				result.filter(this.checkLayer)
					.forEach((layer: ILayer) => {
						if (selectedLayerId.includes(layer.id)) {
							this.addGroupLayer(layer);
						} else {
							this.removeGroupLayer(layer.id);
						}
					});
			})
		);

	protected constructor(protected store$: Store<any>) {
		super();
	}

	abstract checkLayer(layer: ILayer);

	abstract createLayer(layer: ILayer): TileLayer;

	addGroupLayer(layer: ILayer) {
		const group = OpenLayersMap.groupLayers.get(OpenLayersMap.groupsKeys.layers);
		const layersArray = group.getLayers().getArray();
		if (!layersArray.some((shownLayer) => shownLayer.get('id') === layer.id)) {
			const _layer = this.createLayer(layer);
			group.getLayers().push(_layer);
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
