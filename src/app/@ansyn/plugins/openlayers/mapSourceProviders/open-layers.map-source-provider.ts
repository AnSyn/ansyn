import { BaseMapSourceProvider, ImageryLayerProperties, IBaseMapSourceProviderConstructor } from '@ansyn/imagery';
import Layer from 'ol/layer/layer';
import ImageLayer from 'ol/layer/image';
import TileLayer from 'ol/layer/tile';
import { extentFromGeojson, ICaseMapState } from '@ansyn/core';
import * as proj from 'ol/proj';
import XYZ from 'ol/source/XYZ';
import { ProjectableRaster } from '../maps/open-layers-map/models/projectable-raster';

export abstract class OpenLayersMapSourceProvider<CONF = any> extends BaseMapSourceProvider<CONF> {
	create(metaData: ICaseMapState): any[] {
		const source = this.getXYZSource(metaData.data.overlay.imageUrl);
		const extent = this.getExtent(metaData.data.overlay.footprint);
		const tileLayer = this.getTileLayer(source, extent);
		return [tileLayer];
	}

	removeExtraData(layer: any) {
		if (this.isRasterLayer(layer)) {
			layer.getSource().destroy();
		}
		super.removeExtraData(layer);
	}

	protected isRasterLayer(layer: any) {
		return layer instanceof Layer && layer.getSource() instanceof ProjectableRaster;
	}

	getTileLayer(source, extent: [number, number, number, number]): TileLayer {
		const tileLayer = new TileLayer(<any>{
			visible: true,
			preload: Infinity,
			source,
			extent
		});
		const imageLayer = this.getImageLayer(source, extent);
		this.removeExtraData(imageLayer);
		tileLayer.set('imageLayer', imageLayer);
		return tileLayer;
	}

	getImageLayer(source, extent): ImageLayer {
		const imageLayer = new ImageLayer({
			source: new ProjectableRaster({
				sources: [source],
				operation: (pixels) => pixels[0],
				operationType: 'image'
			}),
			extent: extent
		});
		return imageLayer;
	}

	getExtent(footprint, destinationProjCode = 'EPSG:3857') {
		let extent: [number, number, number, number] = extentFromGeojson(footprint);
		[extent[0], extent[1]] = proj.transform([extent[0], extent[1]], 'EPSG:4326', destinationProjCode);
		[extent[2], extent[3]] = proj.transform([extent[2], extent[3]], 'EPSG:4326', destinationProjCode);
		return extent;
	}

	getXYZSource(url: string) {
		const source = new XYZ({
			url: url,
			crossOrigin: 'Anonymous',
			projection: 'EPSG:3857'
		});
		return source;
	}

	addFootprintToLayerPromise(layerPromise: Promise<any>, metaData: ICaseMapState): Promise<any> {
		if (this.forOverlay) {
			return layerPromise.then((layer) => {
				layer.set(ImageryLayerProperties.FOOTPRINT, metaData.data.overlay.footprint);
				return layer;
			});
		}
		return layerPromise;
	}
}
