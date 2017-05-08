/**
 * Created by AsafMas on 07/05/2017.
 */
import { Injectable } from '@angular/core';
import { ImageryProviderService } from '@ansyn/imagery/imageryProviderService/imageryProvider.service';
import { OpenLayerComponent } from '../map/openLayer.component';

@Injectable()
export class RegisterToImageryProviderService {
	constructor(imageryProviderService: ImageryProviderService) {
		imageryProviderService.registerMapProvider('openLayerMap', OpenLayerComponent);
	}
}
