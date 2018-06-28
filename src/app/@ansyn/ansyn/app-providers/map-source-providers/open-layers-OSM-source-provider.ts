import OSM from 'ol/source/osm';
import TileLayer from 'ol/layer/tile';
import { OpenLayersMapSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers.map-source-provider';
import { DisabledOpenLayersMapName } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-disabled-map/openlayers-disabled-map';
import { OpenlayersMapName } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { ImageryMapSource } from '@ansyn/imagery/model/base-map-source-provider';

export const OpenLayerOSMSourceProviderSourceType = 'OSM';


@ImageryMapSource({
	sourceType: OpenLayerOSMSourceProviderSourceType,
	supported: [OpenlayersMapName, DisabledOpenLayersMapName]
})
export class OpenLayerOSMSourceProvider extends OpenLayersMapSourceProvider {
	create(metaData: any): any[] {
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
