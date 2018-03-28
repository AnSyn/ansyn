import { BaseMapSourceProvider } from '@ansyn/imagery';
import XYZ from 'ol/source/xyz';
import TileLayer from 'ol/layer/tile';
import { Injectable } from '@angular/core';
import { OpenlayersMapName } from '@ansyn/plugins/openlayers/open-layers-map';

export const OpenLayerESRI_4326SourceProviderMapType = OpenlayersMapName;
export const OpenLayerESRI_4326SourceProviderSourceType = 'ESRI_4326';

@Injectable()
export class OpenLayerESRI4326SourceProvider extends BaseMapSourceProvider {
	public mapType = OpenLayerESRI_4326SourceProviderMapType;
	public sourceType = OpenLayerESRI_4326SourceProviderSourceType;

	create(metaData: any, mapId: string): any[] {
		const source = new XYZ({
			attributions: 'Copyright:© 2013 ESRI, i-cubed, GeoEye',
			maxZoom: 16,
			projection: 'EPSG:4326',
			tileSize: 512,
			tileUrlFunction: function(tileCoord) {
				return 'https://services.arcgisonline.com/arcgis/rest/services/ESRI_Imagery_World_2D/MapServer/tile/{z}/{y}/{x}'
					.replace('{z}', (tileCoord[0] - 1).toString())
					.replace('{x}', tileCoord[1].toString())
					.replace('{y}', (-tileCoord[2] - 1).toString());
			},
			wrapX: true
		});

		this.monitorSource(source, mapId);

		const esriLayer = new TileLayer({
			source: source,
			visible: true
		});

		return [esriLayer];
	}
}
