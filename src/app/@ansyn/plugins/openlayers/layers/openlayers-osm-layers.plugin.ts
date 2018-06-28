import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { Store } from '@ngrx/store';
import { ImageryPlugin } from '@ansyn/imagery/model/base-imagery-plugin';
import { IMAGERY_MAP_COMPONENTS, ImageryMapComponentConstructor } from '@ansyn/imagery/model/imagery-map-component';
import { Inject } from '@angular/core';
import { BaseOpenlayersLayersPlugin } from '@ansyn/plugins/openlayers/layers/base-openlayers-layers-plugin';


@ImageryPlugin({
	supported: [OpenLayersMap],
	deps: [Store, IMAGERY_MAP_COMPONENTS]
})
export class OpenlayersOsmLayersPlugin extends BaseOpenlayersLayersPlugin {

	constructor(protected store$: Store<any>,
				@Inject(IMAGERY_MAP_COMPONENTS) protected imageryMapComponents: ImageryMapComponentConstructor[]) {
		super(store$, imageryMapComponents);
	}

	// subscribers = [];
	//
	// updateSelectedLayers$: Observable<[ILayer[], string[]]> = combineLatest(this.store$.select(selectLayers), this.store$.select(selectSelectedLayersIds))
	// 	.pipe(
	// 		map(([layers, selectedLayersIds]: [ILayer[], string[]]) => {
	// 			const osmLayers = layers.filter(layer => layer.layerPluginType === layerPluginType.OSM);
	// 			const validSelected = selectedLayersIds.filter(id => osmLayers.some((layer) => layer.id === id));
	// 			return [osmLayers, validSelected];
	// 		}),
	// 		tap(([layers, selectedLayersIds]: [ILayer[], string[]]): void => {
	// 			this.imageryMapComponents
	// 				.filter(({ mapClass }: ImageryMapComponentConstructor) => mapClass.groupLayers.get('layers'))
	// 				.forEach(({ mapClass }: ImageryMapComponentConstructor) => {
	// 					const displayedLayers: any = mapClass.groupLayers.get('layers').getLayers().getArray();
	// 					/* remove layer if layerId not includes on selectLayers */
	// 					displayedLayers.forEach((layer) => {
	// 						const id = layer.get('id');
	// 						if (!selectedLayersIds.includes(id)) {
	// 							this.removeGroupLayer(id, 'layers');
	// 						}
	// 					});
	//
	// 					/* add layer if id includes on selectLayers but not on map */
	// 					selectedLayersIds.forEach((layerId) => {
	// 						const layer = displayedLayers.some((layer: any) => layer.get('id') === layerId);
	// 						if (!layer) {
	// 							const addLayer = layers.find(({ id }) => id === layerId);
	// 							this.addGroupVectorLayer(addLayer, 'layers');
	// 						}
	// 					});
	// 				});
	// 		})
	// 	);
	//
	// constructor(protected store$: Store<any>,
	// 			@Inject(IMAGERY_MAP_COMPONENTS) protected imageryMapComponents: ImageryMapComponentConstructor[]) {
	// 	super();
	// }
	//
	// addGroupVectorLayer(layer: ILayer, groupName: string) {
	// 	const vectorLayer = new TileLayer({
	// 		zIndex: 1,
	// 		source: new OSM({
	// 			attributions: [
	// 				layer.name
	// 			],
	// 			opaque: false,
	// 			url: layer.url,
	// 			crossOrigin: null
	// 		})
	// 	});
	// 	vectorLayer.set('id', layer.id);
	// 	this.addGroupLayer(vectorLayer, groupName);
	// }
	//
	// removeGroupLayer(id: string, groupName: string) {
	// 	const group = OpenLayersMap.groupLayers.get(groupName);
	// 	if (!group) {
	// 		throw new Error('Tried to remove a layer to a non-existent group');
	// 	}
	//
	// 	const layersArray: any[] = group.getLayers().getArray();
	// 	let removeIdx = layersArray.indexOf(layersArray.find(l => l.get('id') === id));
	// 	if (removeIdx >= 0) {
	// 		group.getLayers().removeAt(removeIdx);
	// 	}
	// }
	//
	// addGroupLayer(layer: any, groupName: string) {
	// 	const group = OpenLayersMap.groupLayers.get(groupName);
	// 	if (!group) {
	// 		throw new Error('Tried to add a layer to a non-existent group');
	// 	}
	//
	// 	group.getLayers().push(layer);
	// }
	//
	// onInit() {
	// 	this.subscribers.push(
	// 		this.updateSelectedLayers$.subscribe()
	// 	);
	// }
}
