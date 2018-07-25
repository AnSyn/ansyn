import { Injectable } from '@angular/core';
import 'rxjs/add/operator/withLatestFrom';
import { CasesActionTypes, SaveCaseAsAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { ILayer, layerPluginType } from '@ansyn/menu-items/layers-manager/models/layers.model';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { filter, mergeMap, tap, withLatestFrom } from 'rxjs/internal/operators';
import { DataLayersService } from '@ansyn/menu-items/layers-manager/services/data-layers.service';
import { casesStateSelector } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { Store } from '@ngrx/store';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import {
	AddLayer,
	DeleteAllDefaultCaseLayersAction,
	LayersActionTypes
} from '@ansyn/menu-items/layers-manager/actions/layers.actions';


@Injectable()
export class LayersAppEffects {

	@Effect({dispatch: false})
	onSaveCaseAs$ = this.actions$
		.pipe(
			ofType<SaveCaseAsAction>(CasesActionTypes.SAVE_CASE_AS),
			withLatestFrom(this.store$.select(casesStateSelector)),
			mergeMap(([action, state]: [any, any]) => {
				return Observable.forkJoin([Observable.of(action),
					Observable.of(state),
					this.dataLayersService.getAllLayersInATree({ caseId: state.selectedCase.id }),
					this.dataLayersService.getAllLayersInATree({ caseId: this.casesService.defaultCase.id })
				]);
			}),
			mergeMap(([action, state, layers, defaultCaseLayers]: [any, any, ILayer[], ILayer[]]) => {
				let observers = [];
				layers.filter((layer) => layer.layerPluginType === layerPluginType.Annotations).forEach((layer) => {
					layer.id = UUID.UUID();
					layer.caseId = action.payload.id;
					observers.push(this.dataLayersService.addLayer(layer));
					this.store$.dispatch(new AddLayer(layer));
				});
				return Observable.forkJoin([Observable.of(action), observers]);
			}),
			tap(([action, layers]: [any, any]) => {
				this.store$.dispatch(new DeleteAllDefaultCaseLayersAction());
				console.log('finished');
			})
		);

	@Effect({dispatch: false})
	onDeleteAllDefaultCase$ = this.actions$
		.pipe(
			ofType<DeleteAllDefaultCaseLayersAction>(LayersActionTypes.DELETE_ALL_DEFAULT_CASE_LAYERS),
			withLatestFrom(this.store$.select(casesStateSelector)),
			mergeMap(([action, state]: [any, any]) => Observable.forkJoin([Observable.of(state), this.dataLayersService.getAllLayersInATree({ caseId: this.casesService.defaultCase.id })])),
			filter(([state, layers]: [any, ILayer[]]) => layers.length > 0),
			mergeMap(([state, layers]: [any, ILayer[]]) => {
				let observers = [];
				layers.filter((layer: ILayer) => layer.layerPluginType === layerPluginType.Annotations).forEach((layer: ILayer) => observers.push(this.dataLayersService.removeLayer(layer.id)));
				return Observable.forkJoin(observers);
			})
		);

	constructor(protected dataLayersService: DataLayersService,
				protected casesService: CasesService,
				protected actions$: Actions,
				protected store$: Store<any>
	) {

	}
}
