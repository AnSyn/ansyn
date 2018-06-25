import XYZ from 'ol/source/xyz';
import TileLayer from 'ol/layer/tile';
import { Injectable } from '@angular/core';
import { OpenLayersMapSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers.map-source-provider';

export interface IESRI4326Config {
	baseUrl: string;
	projection: string;
	maxZoom: number;
	tileSize: number;
	attributions: string;
}

export const OpenLayerESRI_4326SourceProviderSourceType = 'ESRI_4326';

@Injectable()
export class OpenLayerESRI4326SourceProvider extends OpenLayersMapSourceProvider {
	public sourceType = OpenLayerESRI_4326SourceProviderSourceType;

	create(metaData: any = this.config[this.sourceType]): any[] {
		const source = new XYZ({
			attributions: metaData.attributions,
			maxZoom: metaData.maxZoom,
			projection: metaData.projection,
			tileSize: metaData.tileSize,
			tileUrlFunction: function (tileCoord) {
				return metaData.baseUrl
					.replace('{z}', (tileCoord[0] - 1).toString())
					.replace('{x}', tileCoord[1].toString())
					.replace('{y}', (-tileCoord[2] - 1).toString());
			},
			wrapX: true
		});

		const esriLayer = new TileLayer({
			source: source,
			visible: true
		});

		return [esriLayer];
	}
}
