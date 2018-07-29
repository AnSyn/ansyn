import { ILayersManagerConfig } from '../models/layers-manager-config';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from '@ansyn/core/services/storage/storage.service';
import { ErrorHandlerService } from '@ansyn/core/services/error-handler.service';
import { ILayer, layerPluginType, LayerType } from '@ansyn/menu-items/layers-manager/models/layers.model';
import { UUID } from 'angular2-uuid';
import { map } from 'rxjs/operators';
import { featureCollection } from '@turf/turf';

export const layersConfig: InjectionToken<ILayersManagerConfig> = new InjectionToken('layers-config');

@Injectable()
export class DataLayersService {

	constructor(@Inject(ErrorHandlerService) public errorHandlerService: ErrorHandlerService,
				protected storageService: StorageService,
				@Inject(layersConfig) public config: ILayersManagerConfig) {
	}

	generateAnnotationLayer(): ILayer {
		return {
			id: UUID.UUID(),
			creationTime: new Date(),
			layerPluginType: layerPluginType.Annotations,
			name: 'Default',
			type: LayerType.annotation,
			data: featureCollection([])
		};
	}

	public getAllLayersInATree({ caseId }): Observable<ILayer[]> {
		return this.storageService.getPage<ILayer>(this.config.schema, 0, 100)
			.catch(err => {
				return this.errorHandlerService.httpErrorHandle(err);
			});
	}
}
