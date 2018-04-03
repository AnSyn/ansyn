import { Component, OnDestroy, OnInit } from '@angular/core';
import { IMapState } from '@ansyn/map-facade/reducers/map.reducer';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';

@Component({
	selector: 'ansyn-welcome-notification',
	templateUrl: './welcome-notification.component.html',
	styleUrls: ['./welcome-notification.component.less']
})
export class WelcomeNotificationComponent implements OnInit, OnDestroy {
	private _subscriptions: Subscription[] = [];

	constructor(public store$: Store<IMapState>) {
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
	}
}
