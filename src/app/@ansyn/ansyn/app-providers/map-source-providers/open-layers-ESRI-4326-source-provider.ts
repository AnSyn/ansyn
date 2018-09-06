import XYZ from 'ol/source/xyz';
import TileLayer from 'ol/layer/tile';
import { OpenLayersDisabledMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-disabled-map/openlayers-disabled-map';
import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { ICaseMapState } from '@ansyn/core/models/case.model';
import { ImageryMapSource } from '@ansyn/imagery/decorators/map-source-provider';
import proj from 'ol/proj';
import { OpenLayersMapSourceProvider } from './open-layers.map-source-provider';

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
export class OpenLayerESRI4326SourceProvider extends OpenLayersMapSourceProvider {
	create(metaData: ICaseMapState): any[] {
		const config = this.config[OpenLayerESRI_4326SourceProviderSourceType];
		const source = new XYZ({
			attributions: config.attributions,
			maxZoom: config.maxZoom,
			projection: config.projection,
			tileSize: config.tileSize,
			tileUrlFunction: function (tileCoord) {
				return config.baseUrl
					.replace('{z}', (tileCoord[0] - 1).toString())
					.replace('{x}', tileCoord[1].toString())
					.replace('{y}', (-tileCoord[2] - 1).toString());
			},
			wrapX: true
		});

		const [x, y] = proj.transform([-180, -90], 'EPSG:4326', config.projection);
		const [x1, y1] = proj.transform([180, 90], 'EPSG:4326', config.projection);

		const esriLayer = new TileLayer({
			source: source,
			visible: true,
			extent: [x, y, x1, y1]
		});

		return [esriLayer];
	}
}
