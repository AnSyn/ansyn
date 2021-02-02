import {
	BaseMapSourceProvider,
	bboxFromGeoJson, CacheService,
	EPSG_3857,
	EPSG_4326, ImageryCommunicatorService,
	ImageryLayerProperties,
	IMapSettings, IMapSourceProvidersConfig, MAP_SOURCE_PROVIDERS_CONFIG
} from '@ansyn/imagery';
import ol_Layer from 'ol/layer/Layer';
import TileLayer from 'ol/layer/Tile';
import * as proj from 'ol/proj';
import XYZ from 'ol/source/XYZ';
import { Inject } from '@angular/core';
import { BBox } from '@turf/helpers';

export const IMAGE_PROCESS_ATTRIBUTE = 'imageLayer';
export abstract class OpenLayersMapSourceProvider<CONF = any> extends BaseMapSourceProvider<CONF> {
	constructor(protected cacheService: CacheService,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				@Inject(MAP_SOURCE_PROVIDERS_CONFIG) protected mapSourceProvidersConfig: IMapSourceProvidersConfig<CONF>) {
		super(cacheService, imageryCommunicatorService, mapSourceProvidersConfig);
	}

	create(metaData: IMapSettings): Promise<ol_Layer> {
		const extent = this.createExtent(metaData);
		const source = this.createSource(metaData);
		const tileLayer = this.createLayer(source, extent);
		return Promise.resolve(tileLayer);
	}

	generateLayerId(metaData: IMapSettings) {
		if (metaData.data.overlay) {
			return `${ metaData.worldView.mapType }/${ metaData.data.overlay.sourceType }/${ metaData.data.overlay.id }`;
		}
		return `${ metaData.worldView.mapType }/${ metaData.data.key }`;
	}

	createLayer(source, extent: BBox): ol_Layer {
		const tileLayer = new TileLayer(<any>{
			visible: true,
			preload: Infinity,
			source,
			extent
		});
		return tileLayer;
	}

	createExtent(metaData: IMapSettings, destinationProjCode = EPSG_3857): BBox {
		const sourceProjection = metaData.data.config && metaData.data.config.projection ? metaData.data.config.projection : EPSG_4326;
		let extent: BBox = metaData.data.overlay ? <[number, number, number, number]>bboxFromGeoJson(metaData.data.overlay.footprint) : [-180, -90, 180, 90];
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
