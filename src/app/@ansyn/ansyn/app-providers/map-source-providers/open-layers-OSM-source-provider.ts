import OSM from 'ol/source/osm';
import TileLayer from 'ol/layer/tile';
import { OpenLayersDisabledMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-disabled-map/openlayers-disabled-map';
import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { ICaseMapState } from '@ansyn/core';
import { ImageryMapSource } from '@ansyn/imagery/decorators/map-source-provider';
import { OpenLayersMapSourceProvider } from './open-layers.map-source-provider';

export const OpenLayerOSMSourceProviderSourceType = 'OSM';


@ImageryMapSource({
	sourceType: OpenLayerOSMSourceProviderSourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap]
})
export class OpenLayerOSMSourceProvider extends OpenLayersMapSourceProvider {
	create(metaData: ICaseMapState): any[] {
		const osmLayer = new TileLayer({
			source: new OSM()
		});

		const source = new OSM(<any>{
			attributions: [
				'All maps © <a href="http://www.openseamap.org/">OpenSeaMap</a>',
				OSM.ATTRIBUTION
			],
			opaque: false,
			url: 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png'
		});

		const openSeaMapLayer = new TileLayer({ source });
		return [osmLayer, openSeaMapLayer];
	}
}
