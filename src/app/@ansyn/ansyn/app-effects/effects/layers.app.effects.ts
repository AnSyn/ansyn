import { Injectable } from '@angular/core';
import 'rxjs/add/operator/withLatestFrom';
import { CasesActionTypes, SaveCaseAsSuccessAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { ILayer, LayerType } from '@ansyn/menu-items/layers-manager/models/layers.model';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { map, mergeMap, withLatestFrom } from 'rxjs/internal/operators';
import { DataLayersService } from '@ansyn/menu-items/layers-manager/services/data-layers.service';
import { Store } from '@ngrx/store';
import { UUID } from 'angular2-uuid';
import { forkJoin } from 'rxjs';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import {
	BeginLayerCollectionLoadAction,
	UpdateSelectedLayersIds
} from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { selectLayers } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';


@Injectable()
export class LayersAppEffects {

	@Effect()
	onSaveCaseAs$ = this.actions$
		.pipe(
			ofType<SaveCaseAsSuccessAction>(CasesActionTypes.SAVE_CASE_AS_SUCCESS),
			mergeMap((action: SaveCaseAsSuccessAction) => {
				console.log(action)
				return [
					new BeginLayerCollectionLoadAction({ caseId: action.payload.id }),
					new UpdateSelectedLayersIds(action.payload.state.layers.activeLayersIds)
				]
			})
		);

	constructor(protected dataLayersService: DataLayersService,
				protected casesService: CasesService,
				protected actions$: Actions,
				protected store$: Store<any>) {

	}
}
