/**
 * Created by AsafMas on 21/05/2017.
 */

import { BaseSourceProvider } from '@ansyn/imagery';
import * as ol from 'openlayers';

export const OpenLayerTileWMSSourceProviderMapType = 'openLayersMap';
export const OpenLayerTileWMSSourceProviderSourceType = 'TileWMS';

export class OpenLayerTileWMSSourceProvider extends BaseSourceProvider {
	public mapType;
	public sourceType;

	constructor() {
		super();

		this.mapType = OpenLayerTileWMSSourceProviderMapType;
		this.sourceType = OpenLayerTileWMSSourceProviderSourceType;
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
