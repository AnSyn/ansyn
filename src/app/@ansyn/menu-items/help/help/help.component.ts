import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { IMenuState, menuStateSelector, SetShowHelpOnStartup } from '@ansyn/menu';

@Component({
	selector: 'ansyn-help',
	templateUrl: './help.component.html',
	styleUrls: ['./help.component.less']
})
export class HelpComponent {

	public showHelpOnStartup$ = this.store.select<IMenuState>(menuStateSelector)
		.pluck<IMenuState, boolean>('showHelpOnStartup')
		.distinctUntilChanged()
		.map(bool => !bool);

	constructor(public store: Store<IMenuState>) {
	}

	onCheckboxClick(isChecked: boolean) {
		this.store.dispatch(new SetShowHelpOnStartup(!isChecked));
	}
}
