import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { IMenuState } from '@ansyn/menu/reducers/menu.reducer';
import { helpComponentConstants } from '@ansyn/menu-items/help/components/help.component.const';
import { SetShowHelpOnStartup } from '@ansyn/menu-items/help/actions/help.actions';
import { selectShowHelpOnStartup } from '@ansyn/menu-items/help/reducer/help.reducer';
import { map } from 'rxjs/internal/operators';

@Component({
	selector: 'ansyn-help',
	templateUrl: './help.component.html',
	styleUrls: ['./help.component.less']
})
export class HelpComponent {

	get const() {
		return helpComponentConstants;
	}

	public dontShowHelpOnStartup$ = this.store.select<boolean>(selectShowHelpOnStartup)
		.pipe(
			map(bool => !bool)
		);

	constructor(public store: Store<IMenuState>) {
	}

	onCheckboxClick(isChecked: boolean) {
		this.store.dispatch(new SetShowHelpOnStartup(!isChecked));
	}

	img(imgName) {
		return this.const.IMG_PATH + imgName;
	}
}
