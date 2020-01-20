import { Component } from '@angular/core';
import { CredentialsService } from '../../services/credentials/credentials.service';
import { Store } from '@ngrx/store';
import { getMenuSessionData, UnSelectMenuItemAction } from '@ansyn/menu';
import { SetUserEnter } from '@ansyn/menu';

@Component({
	selector: 'ansyn-credentials',
	templateUrl: './credentials.component.html',
	styleUrls: ['./credentials.component.less']
})
export class CredentialsComponent {
	constructor(public credentialsService: CredentialsService,
				protected store$: Store<any>) {
		const isUserFirstEnter = getMenuSessionData().isUserFirstEntrance;
		if (isUserFirstEnter) {
			store$.dispatch(new SetUserEnter());
		}
	}

	closeWindow() {
		this.store$.dispatch(new UnSelectMenuItemAction())
	}

}
