import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { CredentialsService } from '../../services/credentials/credentials.service';
import { Store } from '@ngrx/store';
import { getMenuSessionData, UnSelectMenuItemAction } from '@ansyn/menu';
import { SetUserEnter } from '@ansyn/menu';
import { fromEvent, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
	selector: 'ansyn-credentials',
	templateUrl: './credentials.component.html',
	styleUrls: ['./credentials.component.less']
})
export class CredentialsComponent implements OnInit, OnDestroy{
	onClickOutside$: Subscription;

	constructor(public credentialsService: CredentialsService,
				protected store$: Store<any>,
				protected element: ElementRef) {
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
		this.onClickOutside$ = fromEvent(this.element.nativeElement, 'click').pipe(
			tap((event: any) => {
				if ((event.path && !event.path.includes(this.element.nativeElement.lastChild))) {
					this.closeWindow();
				}
			})
		).subscribe();
	}

	ngOnDestroy(): void {
		this.onClickOutside$.unsubscribe();
	}

	closeWindow() {
		this.store$.dispatch(new UnSelectMenuItemAction())
	}

}
