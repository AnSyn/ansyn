import { EPSG_3857, ImageryMapSource, IMapSettings } from '@ansyn/imagery';
import Projection from 'ol/proj/Projection';
import Static from 'ol/source/ImageStatic';
import ImageLayer from 'ol/layer/Image';
import { OpenLayersMap } from '../maps/open-layers-map/openlayers-map/openlayers-map';
import { OpenLayersDisabledMap } from '../maps/openlayers-disabled-map/openlayers-disabled-map';
import { OpenLayersMapSourceProvider } from './open-layers.map-source-provider';

export const OpenLayersStaticImageSourceProviderSourceType = 'STATIC_IMAGE';

@ImageryMapSource({
	sourceType: OpenLayersStaticImageSourceProviderSourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap]
})
export class OpenLayersStaticImageSourceProvider extends OpenLayersMapSourceProvider {

	createExtent(metaData: IMapSettings, destinationProjCode: string = EPSG_3857): [number, number, number, number] {
		return [0, 0, metaData.data.overlay.tag.imageData.imageWidth, metaData.data.overlay.tag.imageData.imageHeight];
	}

	createSource(metaData: IMapSettings): any {
		const extent = this.createExtent(metaData);
		const code = `static-image ${ metaData.data.overlay.id }`;

		const projection = new Projection({
			code,
			units: 'pixels',
			extent
		});

		const source = new Static({
			url: metaData.data.overlay.imageUrl,
			crossOrigin: 'Anonymous',
			imageExtent: extent,
			projection
		});
		return source;
	}

	createLayer(source, extent: [number, number, number, number]): ImageLayer {
		return new ImageLayer({
			source,
			extent
		});
	}

}
