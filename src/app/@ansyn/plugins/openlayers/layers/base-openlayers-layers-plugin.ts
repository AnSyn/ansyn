import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { EntitiesVisualizer } from '@ansyn/plugins/openlayers/visualizers/entities-visualizer';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectLayers, selectSelectedLayersIds } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { map, tap } from 'rxjs/operators';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { ILayer } from '@ansyn/menu-items/layers-manager/models/layers.model';
import { Inject } from '@angular/core';
import { IMapConstructor } from '@ansyn/imagery/model/imap';
import { IMAGERY_IMAP } from '@ansyn/imagery/model/imap-collection';

export abstract class BaseOpenlayersLayersPlugin extends EntitiesVisualizer {

	subscribers = [];

	updateSelectedLayers$: Observable<[ILayer[], string[]]> = combineLatest(this.store$.select(selectLayers), this.store$.select(selectSelectedLayersIds))
		.pipe(
			map(([layers, selectedLayersIds]: [ILayer[], string[]]) =>  this.filterLayers(layers, selectedLayersIds)),
			tap(([layers, selectedLayersIds]: [ILayer[], string[]]): void => {
				this.iMapConstructors
					.filter((iMapConstructor: IMapConstructor) => this.getGroupLayers(iMapConstructor))
					.forEach((iMapConstructor: IMapConstructor) => {
						const displayedLayers: any = this.getGroupLayers(iMapConstructor).getLayers().getArray();
						/* remove layer if layerId not includes on selectLayers */
						displayedLayers.forEach((layer) => {
							const id: string = layer.get('id');
							if (!selectedLayersIds.includes(id)) {
								this.removeDataLayer(id);
							}
						});

						/* add layer if id includes on selectLayers but not on map */
						selectedLayersIds.forEach((layerId) => {
							const layer = displayedLayers.some((layer: any) => layer.get('id') === layerId);
							if (!layer) {
								const addLayer = layers.find(({ id }) => id === layerId);
								this.addDataLayer(addLayer);
							}
						});
					});
			})
		);
	abstract getGroupLayers(iMapConstructor: IMapConstructor): any;

	abstract addDataLayer(data: any): void;

	abstract removeDataLayer(id: string): void;


	abstract relevantLayers(layers): ILayer[] ;

	filterLayers(layers, selectedLayersIds): [ILayer[], string[]] {
		const correctLayers = this.relevantLayers(layers);
		const validSelected = selectedLayersIds.filter(id => correctLayers.some((layer) => layer.id === id));
		return [correctLayers, validSelected];
	}



	removeGroupLayer(id: string, groupName: string) {
		const group = OpenLayersMap.groupLayers.get(groupName);
		if (!group) {
			throw new Error('Tried to remove a layer to a non-existent group');
		}

		const layersArray: any[] = group.getLayers().getArray();
		let removeIdx = layersArray.indexOf(layersArray.find(l => l.get('id') === id));
		if (removeIdx >= 0) {
			group.getLayers().removeAt(removeIdx);
		}
	}

	addGroupLayer(layer: any, groupName: string) {
		const group = OpenLayersMap.groupLayers.get(groupName);
		if (!group) {
			throw new Error('Tried to add a layer to a non-existent group');
		}

		group.getLayers().push(layer);
	}

	constructor(protected store$: Store<any>,
				@Inject(IMAGERY_IMAP) protected iMapConstructors: IMapConstructor[]) {
		super();
	}

	onInit() {
		this.subscribers.push(
			this.updateSelectedLayers$.subscribe()
		);
	}
}
