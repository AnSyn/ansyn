import XYZ from 'ol/source/XYZ';
import TileLayer from 'ol/layer/Tile';
import { EPSG_4326, ImageryMapSource, IMapSettings } from '@ansyn/imagery';
import * as proj from 'ol/proj';
import { OpenLayersMapSourceProvider } from './open-layers.map-source-provider';
import { OpenLayersMap } from '../maps/open-layers-map/openlayers-map/openlayers-map';
import { OpenLayersDisabledMap } from '../maps/openlayers-disabled-map/openlayers-disabled-map';

export interface IESRI4326Config {
	baseUrl: string;
	projection: string;
	maxZoom: number;
	tileSize: number;
	attributions: string;
}

export const OpenLayerESRI_4326SourceProviderSourceType = 'ESRI_4326';

@ImageryMapSource({
	sourceType: OpenLayerESRI_4326SourceProviderSourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap]
})
export class OpenLayerESRI4326SourceProvider extends OpenLayersMapSourceProvider<IESRI4326Config> {
	create(metaData: IMapSettings): Promise<any> {
		const config = {...this.config, ...metaData.data.config};
		const source = new XYZ({
			attributions: config.attributions,
			maxZoom: config.maxZoom,
			projection: config.projection,
			tileSize: config.tileSize,
			crossOrigin: 'Anonymous',
			tileUrlFunction: function (tileCoord) {
				return config.baseUrl
					.replace('{z}', (tileCoord[0] - 1).toString())
					.replace('{x}', tileCoord[1].toString())
					.replace('{y}', (-tileCoord[2] - 1).toString());
			},
			wrapX: true
		});

		const [x, y] = proj.transform([-180, -90], EPSG_4326, config.projection);
		const [x1, y1] = proj.transform([180, 90], EPSG_4326, config.projection);

		const esriLayer = new TileLayer({
			source: source,
			visible: true,
			preload: Infinity,
			extent: [x, y, x1, y1]
		});

		return Promise.resolve(esriLayer);
	}


	/*
	@TODO: insert to map source
	{
  				"key": "ESRI_4326",
  				"displayName": "ESRI 4326",
  				"thumbnail": "https://services.arcgisonline.com/arcgis/rest/services/ESRI_Imagery_World_2D/MapServer/tile/0/0/0.png",
  				"sourceType": "ESRI_4326",
  				"config": {
					"baseUrl": "https://services.arcgisonline.com/arcgis/rest/services/ESRI_Imagery_World_2D/MapServer/tile/{z}/{y}/{x}",
					"projection": "EPSG:4326",
					"maxZoom": 16,
					"tileSize": 256,
					"attributions": "Copyright:© 2013 ESRI, i-cubed, GeoEye"
				}
  			},

	 */
}
