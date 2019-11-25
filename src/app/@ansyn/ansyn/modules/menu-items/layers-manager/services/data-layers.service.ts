import { Inject, Injectable, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { featureCollection } from '@turf/turf';
import { UUID } from 'angular2-uuid';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { Observable, of } from 'rxjs';
import { catchError, filter, tap } from 'rxjs/operators';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { StorageService } from '../../../core/services/storage/storage.service';
import { ICase } from '../../cases/models/case.model';
import { selectSelectedCase } from '../../cases/reducers/cases.reducer';
import { ILayersManagerConfig } from '../models/layers-manager-config';
import { ILayer, layerPluginTypeEnum, LayerType } from '../models/layers.model';
import {
	AddLayerOnBackendFailedAction,
	AddLayerOnBackendSuccessAction,
	RemoveCaseLayersFromBackendAction,
	RemoveCaseLayersFromBackendFailedAction,
	RemoveCaseLayersFromBackendSuccessAction,
	RemoveLayerOnBackendFailedAction,
	RemoveLayerOnBackendSuccessAction,
	UpdateLayerOnBackendFailedAction,
	UpdateLayerOnBackendSuccessAction
} from '../actions/layers.actions';

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


	generateAnnotationLayer(name = 'Default', data: any = featureCollection([]), isNonEditable: boolean = false): ILayer {
		return {
			id: UUID.UUID(),
			creationTime: new Date(),
			layerPluginType: layerPluginTypeEnum.Annotations,
			name,
			caseId: this.caseId,
			type: LayerType.annotation,
			data,
			isNonEditable
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
		if (!this.config.schema) {
			return of([]);
		}
		return this.storageService.searchByCase<ILayer>(this.config.schema, { caseId })
			.pipe(
				catchError(err => {
					console.log(err);
					return this.errorHandlerService.httpErrorHandle(err, 'Failed to load layers');
				})
			);
	}

	addLayer(layer: ILayer): Observable<any> {
		return this.storageService.create('layers', { preview: layer }).pipe(
			tap(() => {
				this.store.dispatch(new AddLayerOnBackendSuccessAction(layer.id));
			}),
			catchError((err) => {
				this.store.dispatch(new AddLayerOnBackendFailedAction(layer, err));
				return this.errorHandlerService.httpErrorHandle(err, 'Failed to create layer');
			})
		)
	}

	updateLayer(layer: ILayer): Observable<any> {
		return this.storageService.update('layers', { preview: layer, data: null }).pipe(
			tap(() => {
				this.store.dispatch(new UpdateLayerOnBackendSuccessAction(layer.id));
			}),
			catchError((err) => {
				this.store.dispatch(new UpdateLayerOnBackendFailedAction(layer, err));
				return this.errorHandlerService.httpErrorHandle(err, 'Can\'t find layer to update');
			})
		)
	}

	removeLayer(layerId: string): Observable<any> {
		return this.storageService.delete('layers', layerId)
			.pipe(
				tap(() => {
					this.store.dispatch(new RemoveLayerOnBackendSuccessAction(layerId));
				}),
				catchError((err) => {
					this.store.dispatch(new RemoveLayerOnBackendFailedAction(layerId, err));
					return this.errorHandlerService.httpErrorHandle(err, 'Failed to remove layer');
				})
			)
	}

	removeCaseLayers(caseId: string): Observable<any> {
		this.store.dispatch(new RemoveCaseLayersFromBackendAction(caseId));
		return this.storageService.deleteByCase('layers', { caseId }).pipe(
			tap(() => {
				this.store.dispatch(new RemoveCaseLayersFromBackendSuccessAction(caseId))
			}),
			catchError((err) => {
				this.store.dispatch(new RemoveCaseLayersFromBackendFailedAction(caseId, err));
				return this.errorHandlerService.httpErrorHandle(err, 'Failed to remove case layers');
			})
		);
	}
}
