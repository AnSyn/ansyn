import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import {
	CopySelectedCaseLinkAction, IStatusBarState, StatusBarActionsTypes, statusBarFlagsItemsEnum,
	UpdateStatusFlagsAction
} from '@ansyn/status-bar';
import { Store } from '@ngrx/store';
import { IAppState } from '../app.effects.module';
import { CopyCaseLinkAction, ICasesState } from '@ansyn/menu-items/cases';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/pluck';
import '@ansyn/core/utils/clone-deep';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { casesStateSelector } from '@ansyn/menu-items/cases/reducers/cases.reducer';


@Injectable()
export class StatusBarAppEffects {


	/**
	 * @type Effect
	 * @name onCopySelectedCaseLink$
	 * @ofType CopySelectedCaseLinkAction
	 * @dependencies cases
	 * @action CopyCaseLinkAction
	 */
	@Effect()
	onCopySelectedCaseLink$ = this.actions$
		.ofType<CopySelectedCaseLinkAction>(StatusBarActionsTypes.COPY_SELECTED_CASE_LINK)
		.withLatestFrom(this.store.select(casesStateSelector), (action: CopySelectedCaseLinkAction, state: ICasesState) => {
			return state.selectedCase.id;
		})
		.map((caseId: string) => {
			return new CopyCaseLinkAction({ caseId: caseId, shareCaseAsQueryParams: true });
		});


	/**
	 * @type Effect
	 * @name onExpand$
	 * @ofType ExpandAction
	 */
	@Effect({ dispatch: false })
	onExpand$: Observable<void> = this.actions$
		.ofType(StatusBarActionsTypes.EXPAND)
		.map(() => {
			console.log('onExpand$');
		});

	constructor(protected actions$: Actions,
				protected store: Store<IAppState>,
				public overlaysService: OverlaysService,
				public casesService: CasesService) {
	}

}
