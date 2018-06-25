import { Component, OnDestroy, OnInit } from '@angular/core';
import { EditCaseComponent } from '../edit-case/edit-case.component';
import { SaveCaseComponent } from '../save-case/save-case.component';
import { ICasesState, selectSelectedCase } from '../../reducers/cases.reducer';
import { Store } from '@ngrx/store';
import { OpenModalAction } from '../../actions/cases.actions';
import { UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { Observable } from 'rxjs/Observable';
import { tap } from 'rxjs/internal/operators';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';

@Component({
	selector: 'ansyn-cases-tools',
	templateUrl: './cases-tools.component.html',
	styleUrls: ['./cases-tools.component.less']
})
export class CasesToolsComponent implements OnInit, OnDestroy {

	private subscriptions = [];
	_selectedCase;
	selectedCase$: Observable<any> = this.store.select(selectSelectedCase)
		.pipe(
			tap((selectedCase) => {
				this._selectedCase = selectedCase;
			})
		);

	constructor(protected store: Store<ICasesState>,
				protected casesService: CasesService) {
	}

	ngOnInit() {
		this.subscriptions.push(
			this.selectedCase$.subscribe()
		);
	}

	ngOnDestroy() {
		this.subscriptions.forEach((sub) => sub.unsubscribe());
	}

	showEditCaseModal(): void {
		this.store.dispatch(new OpenModalAction({ component: EditCaseComponent }));
	}

	showSaveCaseModal(): void {
		this.store.dispatch(new OpenModalAction({ component: SaveCaseComponent }));
	}

	manualSave(): void {
		this.store.dispatch(new UpdateCaseAction({ updatedCase: this._selectedCase, forceUpdate: true }));
	}
}
