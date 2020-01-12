import { ILayerState } from '../reducers/layers.reducer';
import {
	AddLayer,
	BeginLayerCollectionLoadAction,
	LayerCollectionLoadedAction,
	LayersActions,
	LayersActionTypes,
	UpdateLayer
} from '../actions/layers.actions';
import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Actions, Effect, ofType, createEffect } from '@ngrx/effects';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, filter, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { DataLayersService } from '../services/data-layers.service';
import { ILayer, LayerType } from '../models/layers.model';
import { rxPreventCrash } from '../../../core/utils/rxjs/operators/rxPreventCrash';
import { selectAutoSave } from '../../../menu-items/cases/reducers/cases.reducer';

@Injectable()
export class LayersEffects {

	beginLayerTreeLoad = createEffect(() => this.actions$
		.pipe(
			ofType(BeginLayerCollectionLoadAction),
			mergeMap(payload => this.dataLayersService.getAllLayersInATree(payload)),
			map((layers: ILayer[]) => LayerCollectionLoadedAction({payload: layers})),
			catchError(() => of(LayerCollectionLoadedAction({payload: []})))
		));

	onLayerCollectionLoaded$ = createEffect(() => this.actions$.pipe(
		ofType(LayerCollectionLoadedAction),
		filter(payload => !payload.payload.some(({ type }) => type === LayerType.annotation)),
		map(() => {
			const annotationLayer = this.dataLayersService.generateAnnotationLayer();
			return AddLayer({payload: annotationLayer });
		}))
	);

	addLayer$: Observable<any> = createEffect(() => this.actions$.pipe(
		ofType(AddLayer),
		withLatestFrom(this.store$.pipe(select(selectAutoSave))),
		filter(([, autoSave]) => autoSave),
		mergeMap(([payload]) => this.dataLayersService.addLayer(payload.payload)),
		rxPreventCrash()
	),
	{ dispatch: false }
	);

	updateLayer$ = createEffect(() => this.actions$.pipe(
		ofType(UpdateLayer),
		withLatestFrom(this.store$.pipe(select(selectAutoSave))),
		filter(([, autoSave]) => autoSave),
		mergeMap(([payload]) => this.dataLayersService.updateLayer(payload.payload)
			.pipe(
				catchError(() => of(true))
			)
		)),
		{ dispatch: false }
	);

	removeLayer$ = createEffect(() => this.actions$.pipe(
		ofType(RemoveLayer),
		withLatestFrom(this.store$.pipe(select(selectAutoSave))),
		filter(([, autoSave]) => autoSave),
		mergeMap(([payload]: [any, boolean]) => this.dataLayersService.removeLayer(payload.payload)
			.pipe(
				catchError(() => EMPTY)
			)
		)),
		{ dispatch: false }
	);

	constructor(protected actions$: Actions,
				protected dataLayersService: DataLayersService,
				protected store$: Store<ILayerState>) {
	}
}
