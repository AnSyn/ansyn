import { Injectable } from '@angular/core';
import { BaseMapSourceProvider } from '@ansyn/imagery/model/base-map-source-provider';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { extentFromGeojson } from '@ansyn/core/utils/calc-extent';
import { ProjectableRaster } from '@ansyn/plugins/openlayers/open-layers-map/models/projectable-raster';
import XYZ from 'ol/source/xyz';
import proj from 'ol/proj';
import ImageLayer from 'ol/layer/image';
import { OpenLayersMapSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers.map-source-provider';

export const OpenLayerOpenAerialSourceProviderSourceType = 'OPEN_AERIAL';

@Injectable()
export class OpenLayerOpenAerialSourceProvider extends OpenLayersMapSourceProvider {
	public sourceType = OpenLayerOpenAerialSourceProviderSourceType;

	create(metaData: Overlay): any[] {
		const source = new XYZ({
			url: metaData.imageUrl,
			crossOrigin: 'Anonymous',
			projection: 'EPSG:3857'
		});

		let [x, y, x1, y1] = extentFromGeojson(metaData.footprint);
		[x, y] = proj.transform([x, y], 'EPSG:4326', 'EPSG:3857');
		[x1, y1] = proj.transform([x1, y1], 'EPSG:4326', 'EPSG:3857');

		return [new ImageLayer({
			source: new ProjectableRaster({
				sources: [source],
				operation: (pixels) => pixels[0],
				operationType: 'image'
			}),
			extent: [x, y, x1, y1]
		})];
	}

	createAsync(metaData: any): Promise<any> {
		let layer = this.createOrGetFromCache(metaData);
		return Promise.resolve(layer[0]);
	}
}
