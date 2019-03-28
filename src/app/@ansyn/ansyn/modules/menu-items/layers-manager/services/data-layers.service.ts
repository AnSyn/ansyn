import { ILayersManagerConfig } from '../models/layers-manager-config';
import { Inject, Injectable, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ErrorHandlerService, StorageService } from '../../../core/public_api';
import { UUID } from 'angular2-uuid';
import { featureCollection } from '@turf/turf';
import { select, Store } from '@ngrx/store';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { selectSelectedCase } from '../../cases/reducers/cases.reducer';
import { catchError, filter, tap } from 'rxjs/internal/operators';
import { ILayer, layerPluginTypeEnum, LayerType } from '../models/layers.model';
import { ICase } from '@ansyn/imagery';

export const layersConfig = 'layersManagerConfig';

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


	generateAnnotationLayer(name = 'Default', data: any = featureCollection([])): ILayer {
		return {
			id: UUID.UUID(),
			creationTime: new Date(),
			layerPluginType: layerPluginTypeEnum.Annotations,
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
				catchError(err => this.errorHandlerService.httpErrorHandle(err, 'Failed to load layers'))
			);
	}

	addLayer(layer: ILayer): Observable<any> {
		return this.storageService.create('layers', { preview: layer })
			.pipe(catchError((err) => this.errorHandlerService.httpErrorHandle(err, 'Failed to create layer')));
	}

	updateLayer(layer: ILayer): Observable<any> {
		return this.storageService
			.update('layers', { preview: layer, data: null })
			.pipe(catchError((err) => this.errorHandlerService.httpErrorHandle(err, 'Can\'t find layer to update')));
	}

	removeLayer(layerId: string): Observable<any> {
		return this.storageService
			.delete('layers', layerId)
			.pipe(catchError((err) => this.errorHandlerService.httpErrorHandle(err, 'Failed to remove layer')));
	}

	removeCaseLayers(caseId: string): Observable<any> {
		return this.storageService.deleteByCase('layers', { caseId });
	}
}
