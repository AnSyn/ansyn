import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { IMenuState, menuStateSelector } from '@ansyn/menu/reducers/menu.reducer';
import { SetShowHelpOnStartup } from '@ansyn/menu/actions/menu.actions';
import { helpComponentConstants } from '@ansyn/menu-items/help/components/help.component.const';

@Component({
	selector: 'ansyn-help',
	templateUrl: './help.component.html',
	styleUrls: ['./help.component.less']
})
export class HelpComponent {

	get const() {
		return helpComponentConstants;
	}

	public showHelpOnStartup$ = this.store.select<IMenuState>(menuStateSelector)
		.pluck<IMenuState, boolean>('showHelpOnStartup')
		.distinctUntilChanged()
		.map(bool => !bool);

	constructor(public store: Store<IMenuState>) {
	}

	onCheckboxClick(isChecked: boolean) {
		this.store.dispatch(new SetShowHelpOnStartup(!isChecked));
	}

	img(imgName) {
		return this.const.IMG_PATH + imgName;
	}
}
