import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { CredentialsService } from '../../services/credentials/credentials.service';
import { Store } from '@ngrx/store';
import { getMenuSessionData, UnSelectMenuItemAction } from '@ansyn/menu';
import { SetUserEnter } from '@ansyn/menu';
import { tap, filter } from 'rxjs/operators';
import { ClickOutsideService } from '../../click-outside/click-outside.service';
import { AutoSubscriptions, AutoSubscription } from 'auto-subscriptions';
import { LoggerService } from '../../services/logger.service';

@Component({
	selector: 'ansyn-credentials',
	templateUrl: './credentials.component.html',
	styleUrls: ['./credentials.component.less'],
	providers: [ClickOutsideService]
})
@AutoSubscriptions()
export class CredentialsComponent implements OnInit, OnDestroy {

	@AutoSubscription
	onClickOutside$ = () => this.clickOutsideService.onClickOutside(this.element.nativeElement, this.element.nativeElement.lastChild).pipe(
		filter(Boolean),
		tap(() => {
				this.closeWindow();
		})
	);

	constructor(
		public credentialsService: CredentialsService,
		protected store$: Store<any>,
		protected element: ElementRef,
		protected clickOutsideService: ClickOutsideService,
		protected loggerService: LoggerService
	) {
		const menuSession = getMenuSessionData();
		if (menuSession.isUserFirstEntrance) {
			store$.dispatch(new SetUserEnter());
		}
	}

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

	openPermissionSite() {
		this.loggerService.info(`Opening permissions site`, 'Permissions', 'OPEN_PERMISSIONS_SITE');
		this.credentialsService.openPermissionSite();
	}

	downloadGuide() {
		this.loggerService.info(`Downloading permissions guide`, 'Permissions', 'DOWNLOAD_PERMISSIONS_GUIDE');
		this.credentialsService.downloadGuide();
	}

	closeWindow() {
		this.store$.dispatch(new UnSelectMenuItemAction())
	}

}
