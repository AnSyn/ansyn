import { Injectable } from '@angular/core';
import { CasesActionTypes, SaveCaseAsSuccessAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { mergeMap } from 'rxjs/internal/operators';
import { Store } from '@ngrx/store';
import {
	BeginLayerCollectionLoadAction,
	UpdateSelectedLayersIds
} from '@ansyn/menu-items/layers-manager/actions/layers.actions';


@Injectable()
export class LayersAppEffects {

	@Effect()
	onSaveCaseAs$ = this.actions$
		.pipe(
			ofType<SaveCaseAsSuccessAction>(CasesActionTypes.SAVE_CASE_AS_SUCCESS),
			mergeMap((action: SaveCaseAsSuccessAction) => [
					new BeginLayerCollectionLoadAction({ caseId: action.payload.id }),
					new UpdateSelectedLayersIds(action.payload.state.layers.activeLayersIds)
				]
			)
		);

	constructor(protected actions$: Actions,
				protected store$: Store<any>) {

	}
}
