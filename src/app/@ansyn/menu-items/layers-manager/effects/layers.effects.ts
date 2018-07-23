import { ILayerState } from '../reducers/layers.reducer';
import {
	AddLayer,
	BeginLayerCollectionLoadAction,
	LayerCollectionLoadedAction,
	LayersActions,
	LayersActionTypes, UpdateLayer
} from '../actions/layers.actions';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/from';
import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable, EMPTY, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { catchError, filter, map, switchMap, withLatestFrom } from 'rxjs/internal/operators';
import { DataLayersService } from '../services/data-layers.service';
import { ILayer } from '../models/layers.model';
import { layer } from 'openlayers';
import { selectAutoSave } from '../../../core/reducers/core.reducer';
import { ErrorHandlerService } from '@ansyn/core/services/error-handler.service';


@Injectable()
export class LayersEffects {

	/**
	 * @type Effect
	 * @name beginLayerTreeLoad$
	 * @ofType BeginLayerCollectionLoadAction
	 * @dependencies layers
	 * @action LayerCollectionLoadedAction?, ErrorLoadingLayersAction?
	 */
	@Effect()
	beginLayerTreeLoad$: Observable<LayersActions> = this.actions$
		.pipe(
			ofType<BeginLayerCollectionLoadAction>(LayersActionTypes.BEGIN_LAYER_COLLECTION_LOAD),
			mergeMap(({ payload }) => this.dataLayersService.getAllLayersInATree(payload)),
			map((layers: ILayer[]) => new LayerCollectionLoadedAction(layers))
		);

	@Effect({ dispatch: false })
	addLayer$ = this.actions$.pipe(
		ofType<AddLayer>(LayersActionTypes.ADD_LAYER),
		withLatestFrom(this.store$.pipe(select(selectAutoSave))),
		filter(([action, autoSave]) => autoSave),
		mergeMap(([action]) => this.dataLayersService.addLayer(action.payload))
	);

	@Effect({ dispatch: false })
	updateLayer$ = this.actions$.pipe(
		ofType<UpdateLayer>(LayersActionTypes.UPDATE_LAYER),
		withLatestFrom(this.store$.pipe(select(selectAutoSave))),
		filter(([action, autoSave]) => autoSave),
		mergeMap(([action]) => this.dataLayersService.updateLayer(action.payload)
			.pipe(
				catchError(() => of(true))
			)
		)
	);

	@Effect({ dispatch: false })
	removeLayer$ = this.actions$.pipe(
		ofType<UpdateLayer>(LayersActionTypes.REMOVE_LAYER),
		withLatestFrom(this.store$.pipe(select(selectAutoSave))),
		filter(([action, autoSave]) => autoSave),
		mergeMap(([action]) => this.dataLayersService.removeLayer(action.payload)
			.pipe(
				catchError(() => of(true))
			)
		)
	);

	constructor(protected actions$: Actions,
				protected dataLayersService: DataLayersService,
				protected errorHandlerService: ErrorHandlerService,
				protected store$: Store<ILayerState>) {
	}
}
