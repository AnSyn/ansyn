import { Component, OnDestroy, OnInit } from '@angular/core';
import { ISettingsState, selectIsAnaglyphActive } from '../reducers/settings.reducer';
import { Store } from '@ngrx/store';
import { SetAnaglyphStateAction } from '../actions/settings.actions';
import { Observable } from 'rxjs';

@Component({
	selector: 'ansyn-settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.less']
})
export class SettingsComponent implements OnInit, OnDestroy {
	public isAnaglyphEnabled$: Observable<boolean> = this.store.select(selectIsAnaglyphActive);

	constructor(public store: Store<ISettingsState>) {
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
	}

	enableAnaglyph(isChecked) {
		this.store.dispatch(new SetAnaglyphStateAction(isChecked));
	}

}
