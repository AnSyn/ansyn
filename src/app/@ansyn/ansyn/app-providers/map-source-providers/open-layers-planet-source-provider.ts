import XYZ from 'ol/source/xyz';
import ImageLayer from 'ol/layer/image';
import proj from 'ol/proj';
import { extentFromGeojson } from '@ansyn/core';
import { ProjectableRaster } from '@ansyn/plugins/openlayers/open-layers-map/models/projectable-raster';
import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { ICaseMapState } from '@ansyn/core';
import { ImageryMapSource } from '@ansyn/imagery/decorators/map-source-provider';
import { OpenLayersDisabledMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-disabled-map/openlayers-disabled-map';
import { OpenLayersMapSourceProvider } from './open-layers.map-source-provider';

export const OpenLayerPlanetSourceProviderSourceType = 'PLANET';

@ImageryMapSource({
	sourceType: OpenLayerPlanetSourceProviderSourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap]
})
export class OpenLayerPlanetSourceProvider extends OpenLayersMapSourceProvider {
	create(metaData: ICaseMapState): any[] {
		const source = new XYZ({
			url: metaData.data.overlay.imageUrl,
			crossOrigin: 'Anonymous',
			projection: 'EPSG:3857'
		});


		let [x, y, x1, y1] = extentFromGeojson(metaData.data.overlay.footprint);
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

	createAsync(metaData: ICaseMapState): Promise<any> {
		let layer = this.createOrGetFromCache(metaData);
		return Promise.resolve(layer[0]);
	}
}
