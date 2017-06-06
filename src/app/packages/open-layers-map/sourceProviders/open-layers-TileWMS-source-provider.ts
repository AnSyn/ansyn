/**
 * Created by AsafMas on 21/05/2017.
 */

import * as ol from 'openlayers';
import { BaseSourceProvider } from '@ansyn/map-source-provider';

export class OpenLayerTileWMSSourceProvider extends BaseSourceProvider {
	public mapType = 'openLayersMap';
	public sourceType = 'TileWMS';

	constructor() {
		super();
	}

	create(metaData: any): any {
		const resultLayers = [];
		metaData.forEach(layerData=> {
			const tiledLayer = this.createImageLayer(layerData.url, layerData.layerName);
			resultLayers.push(tiledLayer);
		});
		return resultLayers;
	}

	private createImageLayer(url, layerName): ol.layer.Tile {
		const projection = new ol.proj.Projection({
			code: 'EPSG:4326',
			units: 'degrees',
			axisOrientation: 'neu',
			global: true
		});

		const tiled = new ol.layer.Tile({
			visible: true,
			source: new ol.source.TileWMS({
				url: url,
				params: {
					'FORMAT': 'image/png',
					'VERSION': '1.1.1',
					tiled: true,
					STYLES: '',
					LAYERS: layerName,
					tilesOrigin: 34.19140208322269 + ',' + 30.666856822816754
				},
				projection: projection
			})
		});
		return tiled;
	}

	createAsync(metaData: any): Promise<any> {
		let layer = this.create(metaData);
		return Promise.resolve(layer);
	}
}
