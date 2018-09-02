import { ILayersManagerConfig } from '../models/layers-manager-config';
import { Inject, Injectable, InjectionToken, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { StorageService } from '@ansyn/core/services/storage/storage.service';
import { ErrorHandlerService } from '@ansyn/core/services/error-handler.service';
import { ILayer, layerPluginType, LayerType } from '@ansyn/menu-items/layers-manager/models/layers.model';
import { UUID } from 'angular2-uuid';
import { featureCollection } from '@turf/turf';
import { select, Store } from '@ngrx/store';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { selectSelectedCase } from '../../cases/reducers/cases.reducer';
import { ICase } from '@ansyn/core/models/case.model';
import { catchError, filter, tap } from 'rxjs/internal/operators';
import { rxPreventCrash } from '@ansyn/core/utils/rxjs-operators/rxPreventCrash';

export const layersConfig: InjectionToken<ILayersManagerConfig> = new InjectionToken('layers-config');

@Injectable()
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class DataLayersService implements OnInit, OnDestroy {
	caseId: string;

	@AutoSubscription
	caseId$ = this.store
		.pipe(
			/* SelectedCase should move to core store */
			select(selectSelectedCase),
			filter(Boolean),
			tap(({ id }: ICase) => this.caseId = id)
		);


	generateAnnotationLayer(name = 'Default', data = featureCollection([])): ILayer {
		return {
			id: UUID.UUID(),
			creationTime: new Date(),
			layerPluginType: layerPluginType.Annotations,
			name,
			caseId: this.caseId,
			type: LayerType.annotation,
			data
		};
	}

	constructor(@Inject(ErrorHandlerService) public errorHandlerService: ErrorHandlerService,
				protected storageService: StorageService,
				protected store: Store<any>,
				@Inject(layersConfig) public config: ILayersManagerConfig) {
		this.ngOnInit();
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}

	public getAllLayersInATree({ caseId }): Observable<{} | ILayer[]> {
		return this.storageService.searchByCase<ILayer>(this.config.schema, { caseId })
			.pipe(
				catchError(err => this.errorHandlerService.httpErrorHandle(err, 'Failed to load layers')),
				rxPreventCrash()
			);
	}

	addLayer(layer) {
		return this.storageService.create('layers', { preview: layer })
			.pipe(catchError((err) => this.errorHandlerService.httpErrorHandle(err, 'Failed to create layer')));
	}

	updateLayer(layer) {
		return this.storageService
			.update('layers', { preview: layer, data: null })
			.pipe(catchError((err) => this.errorHandlerService.httpErrorHandle(err, 'Can\'t find layer to update')));
	}

	removeLayer(layerId) {
		return this.storageService
			.delete('layers', layerId)
			.pipe(catchError((err) => this.errorHandlerService.httpErrorHandle(err, 'Failed to remove layer')));
	}

	removeCaseLayers(caseId) {
		return this.storageService.deleteByCase('layers', { caseId });
	}
}
