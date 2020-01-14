import { Component } from '@angular/core';
import { CredentialsService } from '../../services/credentials/credentials.service';
import { Store } from '@ngrx/store';
import { UnSelectMenuItemAction } from '@ansyn/menu';

@Component({
	selector: 'ansyn-credentials',
	templateUrl: './credentials.component.html',
	styleUrls: ['./credentials.component.less']
})
export class CredentialsComponent  {
	constructor(protected credentialsService: CredentialsService,
				protected store$: Store<any>) {
	}

	closeWindow() {
		this.store$.dispatch(new UnSelectMenuItemAction())
	}

}
