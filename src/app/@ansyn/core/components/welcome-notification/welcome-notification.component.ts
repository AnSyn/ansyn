import {
	AfterViewInit,
	Component,
	ElementRef,
	HostBinding,
	HostListener,
	Inject,
	OnDestroy
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { coreStateSelector, ICoreState } from '../../reducers/core.reducer';
import { SetWasWelcomeNotificationShownFlagAction } from '../../actions/core.actions';
import { CoreConfig, ICoreConfig } from '../../models';

@Component({
	selector: 'ansyn-welcome-notification',
	templateUrl: './welcome-notification.component.html',
	styleUrls: ['./welcome-notification.component.less']
})
export class WelcomeNotificationComponent implements AfterViewInit, OnDestroy {

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

	// Mark as done, in the store, when losing focus (after a delay, to display a fading animation, before this element is destroyed)
	@HostListener('blur')
	onBlur() {
		setTimeout(() => {
			this.store$.dispatch(new SetWasWelcomeNotificationShownFlagAction(true));
		}, 1000);
	}

	constructor(public store$: Store<ICoreState>,
				public elem: ElementRef,
				@Inject(CoreConfig) public packageConfig: ICoreConfig) {
		this.config = this.packageConfig.welcomeNotification;
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
