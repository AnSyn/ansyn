import { ImageryMapSource, IMapSettings } from '@ansyn/imagery';
import { OpenLayersMapSourceProvider } from './open-layers.map-source-provider';
import { OpenLayersMap } from '../maps/open-layers-map/openlayers-map/openlayers-map';
import { OpenLayersDisabledMap } from '../maps/openlayers-disabled-map/openlayers-disabled-map';


export const OpenLayerAirbusSourceProviderSourceType = 'AIRBUS';

@ImageryMapSource({
	sourceType: OpenLayerAirbusSourceProviderSourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap]
})
export class OpenLayersAirbusSourceProvider extends OpenLayersMapSourceProvider {
	id: string;

	create(metaData: IMapSettings): Promise<any> {
		this.id = metaData.data.overlay.id;
		return super.create(metaData);

	}
}
