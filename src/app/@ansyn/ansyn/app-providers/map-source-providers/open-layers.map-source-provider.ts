import { BaseMapSourceProvider, CacheService, ImageryCommunicatorService } from '@ansyn/imagery';
import { Inject } from '@angular/core';
import { ProjectableRaster } from '@ansyn/plugins';
import Layer from 'ol/layer/layer';
import { IMapSourceProvidersConfig, MAP_SOURCE_PROVIDERS_CONFIG } from './map-source-providers-config';
import ImageLayer from 'ol/layer/image';
import TileLayer from 'ol/layer/tile';
import { extentFromGeojson } from '@ansyn/core';
import proj from 'ol/proj';
import XYZ from 'ol/source/xyz';

export abstract class OpenLayersMapSourceProvider extends BaseMapSourceProvider {
	constructor(protected cacheService: CacheService,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				@Inject(MAP_SOURCE_PROVIDERS_CONFIG) protected config: IMapSourceProvidersConfig) {
		super(cacheService, imageryCommunicatorService);
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
}
