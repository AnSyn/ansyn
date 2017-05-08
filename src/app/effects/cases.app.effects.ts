import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { IAppState } from '../app.reducers.module';
import { Observable } from 'rxjs';
import { ActionTypes } from '../packages/timeline/actions/timeline.actions';
import { CasesService } from '../packages/menu-items/cases/services/cases.service';
import { Overlay } from '../packages/timeline/models/overlay.model';
import { ICasesState } from '../packages/menu-items/cases/reducers/cases.reducer';
import { Case } from '../packages/menu-items/cases/models/case.model';
import { UpdateCaseSuccessAction } from '../packages/menu-items/cases/actions/cases.actions';

@Injectable()
export class CasesAppEffects{

	constructor(private actions$: Actions, private store$: Store<IAppState>, private casesService: CasesService) {}

	@Effect()
	selectOverlay$: Observable<Action> = this.actions$
		.ofType(ActionTypes.SELECT_OVERLAY)
		.withLatestFrom(this.store$.select('cases'))
		.switchMap( ([action, state]: [{payload: any}, ICasesState]) => {
			let selected_case: Case = state.cases.find((case_value) =>  case_value.id == state.selected_case_id);
			selected_case.state.selected_overlay_id = action.payload;
			return this.casesService.updateCase(selected_case).map((updated_case) => {
				return new UpdateCaseSuccessAction(updated_case);
			});
		});


}
