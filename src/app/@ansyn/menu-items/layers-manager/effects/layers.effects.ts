import { ILayerState } from '../reducers/layers.reducer';
import {
	AddLayer,
	BeginLayerCollectionLoadAction,
	LayerCollectionLoadedAction,
	LayersActions,
	LayersActionTypes,
	UpdateLayer
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
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { catchError, filter, map, withLatestFrom } from 'rxjs/internal/operators';
import { DataLayersService } from '../services/data-layers.service';
import { ILayer, LayerType } from '../models/layers.model';
import { rxPreventCrash, selectAutoSave } from '@ansyn/core';


@Injectable()
export class LayersEffects {

	@Effect()
	beginLayerTreeLoad$: Observable<LayersActions> = this.actions$
		.pipe(
			ofType<BeginLayerCollectionLoadAction>(LayersActionTypes.BEGIN_LAYER_COLLECTION_LOAD),
			mergeMap(({ payload }) => this.dataLayersService.getAllLayersInATree(payload)),
			map((layers: ILayer[]) => new LayerCollectionLoadedAction(layers)),
			catchError((exception) => {
				this.store$.dispatch(new LayerCollectionLoadedAction([]));
				return EMPTY;
			})
		);

	@Effect()
	onLayerCollectionLoaded$ = this.actions$.pipe(
		ofType<LayerCollectionLoadedAction>(LayersActionTypes.LAYER_COLLECTION_LOADED),
		filter((action) => !action.payload.some(({ type }) => type === LayerType.annotation)),
		map(() => {
			const annotationLayer = this.dataLayersService.generateAnnotationLayer();
			return new AddLayer(annotationLayer);
		})
	);

	@Effect({ dispatch: false })
	addLayer$: Observable<any> = this.actions$.pipe(
		ofType<AddLayer>(LayersActionTypes.ADD_LAYER),
		withLatestFrom(this.store$.pipe(select(selectAutoSave))),
		filter(([action, autoSave]) => autoSave),
		mergeMap(([action]) => this.dataLayersService.addLayer(action.payload)),
		rxPreventCrash()
	);

	@Effect({ dispatch: false })
	updateLayer$: Observable<any> = this.actions$.pipe(
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
		mergeMap(([action]: [any, boolean]) => this.dataLayersService.removeLayer(action.payload)
			.pipe(
				catchError(() => EMPTY)
			)
		)
	);

	constructor(protected actions$: Actions,
				protected dataLayersService: DataLayersService,
				protected store$: Store<ILayerState>) {
	}
}
