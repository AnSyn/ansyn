import { AfterViewInit, Component, ElementRef, HostBinding, OnDestroy } from '@angular/core';
import { IMapState } from '@ansyn/map-facade/reducers/map.reducer';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { coreStateSelector, ICoreState } from '@ansyn/core/reducers/core.reducer';

@Component({
	selector: 'ansyn-welcome-notification',
	templateUrl: './welcome-notification.component.html',
	styleUrls: ['./welcome-notification.component.less']
})
export class WelcomeNotificationComponent implements AfterViewInit, OnDestroy {

	private _subscriptions: Subscription[] = [];

	isAfterLogin$ = this.store$.select(coreStateSelector)
		.take(1)
		.pluck<ICoreState, boolean>('isAfterLogin')
		// .do(() => this.store$.dispatch(new SetIsAfterLoginFlagAction(false)))
	;

	// Make the DOM element focusable
	@HostBinding('attr.tabindex')
	get tabindex() {
		return 0;
	}

	constructor(public store$: Store<IMapState>,
				protected elem: ElementRef) {
	}

	ngAfterViewInit() {
		this._subscriptions.push(
			this.isAfterLogin$.subscribe(isAfterLogin => {
				if (isAfterLogin) {
					this.elem.nativeElement.focus();
				}
			})
		);
	}

	ngOnDestroy(): void {
		this._subscriptions.forEach(observable$ => observable$.unsubscribe());
	}
}
