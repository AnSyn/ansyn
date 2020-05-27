import {
	BaseMapSourceProvider,
	bboxFromGeoJson,
	EPSG_3857,
	EPSG_4326,
	ImageryLayerProperties,
	IMapSettings
} from '@ansyn/imagery';
import ol_Layer from 'ol/layer/Layer';
import ImageLayer from 'ol/layer/Image';
import TileLayer from 'ol/layer/Tile';
import * as proj from 'ol/proj';
import XYZ from 'ol/source/XYZ';
import { ProjectableRaster } from '../maps/open-layers-map/models/projectable-raster';
export const IMAGE_PROCESS_ATTRIBUTE = 'imageLayer';
export abstract class OpenLayersMapSourceProvider<CONF = any> extends BaseMapSourceProvider<CONF> {
	create(metaData: IMapSettings): Promise<ol_Layer> {
		const extent = this.createExtent(metaData);
		const source = this.createSource(metaData);
		const tileLayer = this.createLayer(source, extent);
		// if (metaData.data.overlay) {
			// for image process;
		tileLayer.set(IMAGE_PROCESS_ATTRIBUTE, this.getImageLayer(source, extent));
		// }
		return Promise.resolve(tileLayer);
	}

	generateLayerId(metaData: IMapSettings) {
		if (metaData.data.overlay) {
			return `${ metaData.worldView.mapType }/${ metaData.data.overlay.sourceType }/${ metaData.data.overlay.id }`;
		}
		return `${ metaData.worldView.mapType }/${ metaData.data.key }`;
	}

	removeExtraData(layer: ol_Layer) {
		if (this.isRasterLayer(layer)) {
			layer.getSource().destroy();
		}
		super.removeExtraData(layer);
	}

	protected isRasterLayer(layer: ol_Layer) {
		return layer instanceof ol_Layer && layer.getSource() instanceof ProjectableRaster;
	}

	createLayer(source, extent: [number, number, number, number]): ol_Layer {
		const tileLayer = new TileLayer(<any>{
			visible: true,
			preload: Infinity,
			source,
			extent
		});
		const imageLayer = this.getImageLayer(source, extent);
		this.removeExtraData(imageLayer);
		tileLayer.set(IMAGE_PROCESS_ATTRIBUTE, imageLayer);
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

	createExtent(metaData: IMapSettings, destinationProjCode = EPSG_3857) {
		const sourceProjection = metaData.data.config && metaData.data.config.projection ? metaData.data.config.projection : EPSG_4326;
		let extent: [number, number, number, number] = metaData.data.overlay ? <[number, number, number, number]>bboxFromGeoJson(metaData.data.overlay.footprint) : [-180, -90, 180, 90];
		[extent[0], extent[1]] = proj.transform([extent[0], extent[1]], sourceProjection, destinationProjCode);
		[extent[2], extent[3]] = proj.transform([extent[2], extent[3]], sourceProjection, destinationProjCode);
		return extent;
	}

	createSource(metaData: IMapSettings) {
		const source = new XYZ({
			url: metaData.data.overlay.imageUrl,
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

	setExtraData(layer: ol_Layer, extraData: any): void {
		Object.entries(extraData).forEach(([key, value]) => {
			layer.set(key, value)
		})
	}
}
