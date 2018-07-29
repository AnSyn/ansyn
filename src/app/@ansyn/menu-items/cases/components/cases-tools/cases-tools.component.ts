import { Component } from '@angular/core';
import { EditCaseComponent } from '../edit-case/edit-case.component';
import { SaveCaseComponent } from '../save-case/save-case.component';
import { ICasesState, selectSelectedCase } from '../../reducers/cases.reducer';
import { Store } from '@ngrx/store';
import { OpenModalAction } from '../../actions/cases.actions';
import { ManualSaveAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { Observable } from 'rxjs/Observable';
import { tap } from 'rxjs/internal/operators';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';

@Component({
	selector: 'ansyn-cases-tools',
	templateUrl: './cases-tools.component.html',
	styleUrls: ['./cases-tools.component.less']
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class CasesToolsComponent {
	_selectedCase;

	@AutoSubscription
	selectedCase$: Observable<any> = this.store.select(selectSelectedCase)
		.pipe(
			tap((selectedCase) => {
				this._selectedCase = selectedCase;
			})
		);

	constructor(protected store: Store<ICasesState>,
				protected casesService: CasesService) {
	}

	showEditCaseModal(): void {
		this.store.dispatch(new OpenModalAction({ component: EditCaseComponent }));
	}

	showSaveCaseModal(): void {
		this.store.dispatch(new OpenModalAction({ component: SaveCaseComponent }));
	}

	manualSave(): void {
		this.store.dispatch(new ManualSaveAction(this._selectedCase));
	}
}
