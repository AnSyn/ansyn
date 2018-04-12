import {
	AfterViewInit,
	Component,
	ElementRef,
	EventEmitter,
	HostBinding,
	HostListener,
	Inject,
	OnDestroy, Output
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { coreStateSelector, ICoreState } from '@ansyn/core/reducers/core.reducer';
import { IMapFacadeConfig } from '@ansyn/map-facade/models/map-config.model';
import { mapFacadeConfig } from '@ansyn/map-facade/models/map-facade.config';
import { SetWasWelcomeNotificationShownFlagAction } from '@ansyn/core';

@Component({
	selector: 'ansyn-welcome-notification',
	templateUrl: './welcome-notification.component.html',
	styleUrls: ['./welcome-notification.component.less']
})
export class WelcomeNotificationComponent implements AfterViewInit, OnDestroy {

	@Output() hideMe = new EventEmitter<any>();

	private _subscriptions: Subscription[] = [];

	public config: any = {};

	wasWelcomeNotificationShown$ = this.store$.select(coreStateSelector)
		.take(1)
		.pluck<ICoreState, boolean>('wasWelcomeNotificationShown')
		;

	// Make the DOM element focusable
	@HostBinding('attr.tabindex')
	get tabindex() {
		return 0;
	}

	// Mark as done, in the store, when losing focus,
	// and then signal my container to hide me (after a delay, to display a fading animation)
	@HostListener('blur')
	onBlur() {
		this.store$.dispatch(new SetWasWelcomeNotificationShownFlagAction(true));
		setTimeout(() => {
			this.hideMe.emit();
		}, 1000);
	}

	constructor(public store$: Store<ICoreState>,
				public elem: ElementRef,
				@Inject(mapFacadeConfig) public mapFacadeconfig: IMapFacadeConfig) {
		this.config = this.mapFacadeconfig.welcomeNotification;
	}

	ngAfterViewInit() {
		this._subscriptions.push(
			this.wasWelcomeNotificationShown$.subscribe(wasWelcomeNotificationShown => {
				if (!wasWelcomeNotificationShown) {
					this.elem.nativeElement.focus();
				}
			})
		);
	}

	ngOnDestroy(): void {
		this._subscriptions.forEach(observable$ => observable$.unsubscribe());
	}
}
