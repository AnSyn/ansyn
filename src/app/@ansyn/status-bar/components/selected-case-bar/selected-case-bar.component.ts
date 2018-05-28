import { Component, Input, OnInit } from '@angular/core';
import { CopySelectedCaseLinkAction } from '@ansyn/status-bar/actions/status-bar.actions';
import { IStatusBarState } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { Store } from '@ngrx/store';

@Component({
	selector: 'ansyn-selected-case-bar',
	templateUrl: './selected-case-bar.component.html',
	styleUrls: ['./selected-case-bar.component.less']
})
export class SelectedCaseBarComponent implements OnInit {
	@Input() selectedCaseName;

	constructor(public store: Store<IStatusBarState>) {
	}

	copyLink(): void {
		this.store.dispatch(new CopySelectedCaseLinkAction());
	}

	ngOnInit() {
	}

}
