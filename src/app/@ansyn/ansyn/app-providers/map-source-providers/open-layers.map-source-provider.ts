import { BaseMapSourceProvider } from '@ansyn/imagery/model/base-map-source-provider';
import { OpenlayersMapName } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { DisabledOpenLayersMapName } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-disabled-map/openlayers-disabled-map';

export abstract class OpenLayersMapSourceProvider extends BaseMapSourceProvider {
	supported = [OpenlayersMapName, DisabledOpenLayersMapName];
}
