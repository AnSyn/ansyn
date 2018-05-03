import { ILayersManagerConfig } from '../models/layers-manager-config';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { StorageService } from '@ansyn/core/services/storage/storage.service';
import { ErrorHandlerService } from '@ansyn/core/services/error-handler.service';
import { LayersContainer } from '@ansyn/menu-items/layers-manager/models/layers.model';

export const layersConfig: InjectionToken<ILayersManagerConfig> = new InjectionToken('layers-config');

@Injectable()
export class DataLayersService {

	constructor(@Inject(ErrorHandlerService) public errorHandlerService: ErrorHandlerService,
				protected storageService: StorageService,
				@Inject(layersConfig) public config: ILayersManagerConfig) {
	}

	public getAllLayersInATree(): Observable<LayersContainer[]> {
		return this.storageService.getPage<LayersContainer>(this.config.schema, 0, 100)
			.catch(err => {
				return this.errorHandlerService.httpErrorHandle(err);
			});
	}
}
