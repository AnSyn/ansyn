import { Injectable } from '@angular/core';
import { OpenLayerIDAHOSourceProvider } from './open-layers-IDAHO-source-provider';

export const OpenLayerIDAHO2SourceProviderSourceType = 'IDAHO2';

@Injectable()
export class OpenLayerIDAHO2SourceProvider extends OpenLayerIDAHOSourceProvider {
	public sourceType = OpenLayerIDAHO2SourceProviderSourceType;
}
