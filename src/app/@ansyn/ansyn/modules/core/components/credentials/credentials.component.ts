import { Component, OnDestroy, OnInit } from '@angular/core';
import { CredentialsService } from '../../services/credentials/credentials.service';
import { tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { UnSelectMenuItemAction } from '@ansyn/menu';
import { sessionData } from '../../../../../map-facade/models/core-session-state.model';

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
