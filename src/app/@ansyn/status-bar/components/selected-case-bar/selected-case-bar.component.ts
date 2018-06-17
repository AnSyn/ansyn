import { Component, Input } from '@angular/core';
import { CopySelectedCaseLinkAction } from '@ansyn/status-bar/actions/status-bar.actions';
import { IStatusBarState } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { Store } from '@ngrx/store';
import { Case } from '@ansyn/core/models/case.model';
import { Observable } from 'rxjs/Observable';
import { selectSelectedCase } from '@ansyn/core/reducers/core.reducer';

@Component({
	selector: 'ansyn-selected-case-bar',
	templateUrl: './selected-case-bar.component.html',
	styleUrls: ['./selected-case-bar.component.less']
})
export class SelectedCaseBarComponent {
	selectedCaseName$: Observable<string> = this.store.select(selectSelectedCase)
		.map((selectSelected: Case) => selectSelected ? selectSelected.name : 'Default Case');

	constructor(public store: Store<IStatusBarState>) {
	}

	copyLink(): void {
		this.store.dispatch(new CopySelectedCaseLinkAction());
	}

}
