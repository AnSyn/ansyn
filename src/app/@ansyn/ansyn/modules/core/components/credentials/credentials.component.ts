import { Component, OnDestroy, OnInit } from '@angular/core';
import { CredentialsService } from '../../services/credentials/credentials.service';
import { tap } from 'rxjs/operators';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { Store } from '@ngrx/store';
import { selectIsMinimalistViewMode } from '@ansyn/map-facade';

@Component({
	selector: 'ansyn-credentials',
	templateUrl: './credentials.component.html',
	styleUrls: ['./credentials.component.less']
})
@AutoSubscriptions()
export class CredentialsComponent implements OnInit, OnDestroy {
	isOpen: boolean;
	show: boolean;
	credentialsMessage: any;

	@AutoSubscription
	isMinimalistViewMode$ = this.store$.select(selectIsMinimalistViewMode).pipe(
		tap(isMinimalistViewMode => {
			this.show = !isMinimalistViewMode;
		})
	);

	constructor(protected credentialsService: CredentialsService,
				protected store$: Store<any>) {
		this.isOpen = false;
	}

	ngOnInit() {
		this.credentialsService.getCredentials().pipe(
			tap(() => {
				this.credentialsMessage = this.credentialsService.credentials;
			})
		).subscribe();
	}

	ngOnDestroy() {

	}

	openCredentials() {
	}

	setIsOpenMode() {
		this.isOpen = !this.isOpen;
	}
}
