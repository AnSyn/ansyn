/**
 * Created by AsafMas on 21/05/2017.
 */

import { BaseSourceProvider } from '@ansyn/imagery';
import * as ol from 'openlayers';

export class OpenLayerTileWMSSourceProvider extends BaseSourceProvider {
	static s_mapType = 'openLayersMap';
	static s_sourceType = 'TileWMS';

	public mapType;
	public sourceType;

	constructor() {
		super();

		this.mapType = OpenLayerTileWMSSourceProvider.s_mapType;
		this.sourceType = OpenLayerTileWMSSourceProvider.s_sourceType;
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
