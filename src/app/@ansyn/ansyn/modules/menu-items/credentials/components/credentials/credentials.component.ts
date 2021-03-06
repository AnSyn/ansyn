import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { CredentialsService } from '../../../../core/services/credentials/credentials.service';
import { Store } from '@ngrx/store';
import { getMenuSessionData, SetBadgeAction } from '@ansyn/menu';
import { tap, filter } from 'rxjs/operators';
import { ClickOutsideService } from '../../../../core/click-outside/click-outside.service';
import { AutoSubscriptions, AutoSubscription } from 'auto-subscriptions';
import { setMenuSessionData } from '@ansyn/menu';
import { LogDownloadPermissionsGuide, LogOpenPermissionsSite } from '../../actions/credentials.actions';

@Component({
	selector: 'ansyn-credentials',
	templateUrl: './credentials.component.html',
	styleUrls: ['./credentials.component.less']
})
@AutoSubscriptions()
export class CredentialsComponent implements OnInit, OnDestroy {
	@Output() closeMe = new EventEmitter<any>();

	constructor(
		public credentialsService: CredentialsService,
		protected store$: Store<any>,
		protected element: ElementRef,
		protected clickOutsideService: ClickOutsideService,
	) {
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

	openPermissionSite() {
		this.store$.dispatch(new LogOpenPermissionsSite());
		this.credentialsService.openPermissionSite();
	}

	downloadGuide() {
		this.store$.dispatch(new LogDownloadPermissionsGuide());
		this.credentialsService.downloadGuide();
	}

	closeWindow() {
		this.closeMe.emit();
	}

}
