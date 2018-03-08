import { BaseMapSourceProvider } from 'app/@ansyn/imagery/index';
import XYZ from 'ol/source/xyz';
import ImageLayer from 'ol/layer/image';
import { ProjectableRaster } from '@ansyn/plugins/openlayers/open-layers-map';
import { Injectable } from '@angular/core';
import { Overlay } from 'app/@ansyn/core/index';
import { extentFromGeojson } from 'app/@ansyn/core/utils/index';
import proj from 'ol/proj';

export const OpenLayerOpenAerialSourceProviderMapType = 'openLayersMap';
export const OpenLayerOpenAerialSourceProviderSourceType = 'OPEN_AERIAL';

@Injectable()
export class OpenLayerOpenAerialSourceProvider extends BaseMapSourceProvider {

	public mapType = OpenLayerOpenAerialSourceProviderMapType;
	public sourceType = OpenLayerOpenAerialSourceProviderSourceType;

	create(metaData: Overlay, mapId: string): any {
		const source = new XYZ({
			url: metaData.imageUrl,
			crossOrigin: 'Anonymous',
			projection: 'EPSG:3857' // Check correct EPSG?
		});

		this.monitorSource(source, mapId);
		let [x, y, x1, y1] = extentFromGeojson(metaData.footprint);
		[x, y] = proj.transform([x, y], 'EPSG:4326', 'EPSG:3857'); // Check correct EPSG?do i even need a transformation?
		[x1, y1] = proj.transform([x1, y1], 'EPSG:4326', 'EPSG:3857'); // Check correct EPSG?do i even need a transformation?

		return new ImageLayer({
			source: new ProjectableRaster({
				sources: [source],
				operation: (pixels) => pixels[0],
				operationType: 'image'
			}),
			extent: [x, y, x1, y1]
		});
	}

	createAsync(metaData: any, mapId: string): Promise<any> {
		let layer = this.create(metaData, mapId);
		return Promise.resolve(layer);
	}
}
