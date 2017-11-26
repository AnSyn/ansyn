import { Injectable } from '@angular/core';
import { OpenLayerIDAHOSourceProvider } from './open-layers-IDAHO-source-provider';

export const OpenLayerIDAHO2SourceProviderSourceType = 'IDAHO2';
// TODO: Remove "OpenLayerIDAHO2SourceProvider" when new valid source provider is added 
@Injectable()
export class OpenLayerIDAHO2SourceProvider extends OpenLayerIDAHOSourceProvider {
	public sourceType = OpenLayerIDAHO2SourceProviderSourceType;
}
