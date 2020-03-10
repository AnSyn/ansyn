import {
	BaseMapSourceProvider,
	bboxFromGeoJson,
	EPSG_3857,
	EPSG_4326,
	ImageryLayerProperties,
	IMapSettings
} from '@ansyn/imagery';
import Layer from 'ol/layer/Layer';
import ImageLayer from 'ol/layer/Image';
import TileLayer from 'ol/layer/Tile';
import * as proj from 'ol/proj';
import XYZ from 'ol/source/XYZ';
import { ProjectableRaster } from '../maps/open-layers-map/models/projectable-raster';

export abstract class OpenLayersMapSourceProvider<CONF = any> extends BaseMapSourceProvider<CONF> {
	create(metaData: IMapSettings): Promise<any> {
		const source = this.getXYZSource(metaData.data.overlay.imageUrl);
		const extent = this.getExtent(metaData.data.overlay.footprint);
		const tileLayer = this.getTileLayer(source, extent);
		return Promise.resolve(tileLayer);
	}

	generateLayerId(metaData: IMapSettings) {
		if (metaData.data.overlay) {
			return `${ metaData.worldView.mapType }/${ metaData.data.overlay.sourceType }/${ metaData.data.overlay.id }`;
		}
		return `${ metaData.worldView.mapType }/${ metaData.data.key }`;
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

	getExtent(footprint, destinationProjCode = EPSG_3857) {
		let extent: [number, number, number, number] = <[number, number, number, number]>bboxFromGeoJson(footprint);
		[extent[0], extent[1]] = proj.transform([extent[0], extent[1]], EPSG_4326, destinationProjCode);
		[extent[2], extent[3]] = proj.transform([extent[2], extent[3]], EPSG_4326, destinationProjCode);
		return extent;
	}

	getXYZSource(url: string) {
		const source = new XYZ({
			url: url,
			crossOrigin: 'Anonymous',
			projection: EPSG_3857
		});
		return source;
	}

	generateExtraData(metaData: IMapSettings) {
		if (metaData.data.overlay) {
			return { [ImageryLayerProperties.FOOTPRINT]: metaData.data.overlay.footprint }
		}
		return {}
	}

	setExtraData(layer: any, extraData: any): void {
		Object.entries(extraData).forEach(([key, value]) => {
			layer.set(key, value)
		})
	}
}
