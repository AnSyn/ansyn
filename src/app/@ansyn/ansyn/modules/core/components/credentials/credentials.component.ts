import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { CredentialsService } from '../../services/credentials/credentials.service';
import { Store } from '@ngrx/store';
import { getMenuSessionData, SetBadgeAction, UnSelectMenuItemAction } from '@ansyn/menu';
import { fromEvent, Subscription } from 'rxjs';
import { tap, filter } from 'rxjs/operators';
import { ClickOutsideService } from '../../click-outside/click-outside.service';
import { AutoSubscriptions, AutoSubscription } from 'auto-subscriptions';
import { setMenuSessionData } from '@ansyn/menu';

@Component({
	selector: 'ansyn-credentials',
	templateUrl: './credentials.component.html',
	styleUrls: ['./credentials.component.less']
})
@AutoSubscriptions()
export class CredentialsComponent implements OnInit, OnDestroy {

	constructor(public credentialsService: CredentialsService,
				protected store$: Store<any>,
				protected element: ElementRef,
				protected clickOutsideService: ClickOutsideService) {
		const menuSession = getMenuSessionData();
		if (menuSession.isUserFirstEntrance) {
			setMenuSessionData({ isUserFirstEntrance: false });
			this.store$.dispatch(new SetBadgeAction({ key: 'Permissions', badge: undefined }));
		}
	}

	@AutoSubscription
	onClickOutside$ = () => this.clickOutsideService.onClickOutside({target: this.element.nativeElement, monitor: this.element.nativeElement.lastChild}).pipe(
		filter(Boolean),
		tap(() => {
				this.closeWindow();
		})
	);

	hasAuthorized() {
		return this.credentialsService.authorizedAreas.length > 0;
	}

	hasNoAuthorized() {
		return this.credentialsService.unauthorizedAreas.length > 0;
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
	}

	closeWindow() {
		this.store$.dispatch(new UnSelectMenuItemAction())
	}

}
