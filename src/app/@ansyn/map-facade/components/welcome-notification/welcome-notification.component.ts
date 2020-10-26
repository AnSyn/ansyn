import { AfterViewInit, Component, ElementRef, HostBinding, HostListener, Inject, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { selectWasWelcomeNotificationShown } from '../../reducers/map.reducer';
import { SetWasWelcomeNotificationShownFlagAction } from '../../actions/map.actions';
import { IMapFacadeConfig } from '../../models/map-config.model';
import { mapFacadeConfig } from '../../models/map-facade.config';
import { CaseGeoFilter } from '../../../ansyn/modules/menu-items/cases/models/case.model';
import { selectGeoFilterType } from '../../../ansyn/modules/status-bar/reducers/status-bar.reducer';

@Component({
	selector: 'ansyn-welcome-notification',
	templateUrl: './welcome-notification.component.html',
	styleUrls: ['./welcome-notification.component.less']
})
export class WelcomeNotificationComponent implements AfterViewInit, OnDestroy {

	// Make the DOM element focusable
	@HostBinding('attr.tabindex')
	get tabindex() {
		return 0;
	}

	private _subscriptions: Subscription[] = [];

	public config: any = {};

	wasWelcomeNotificationShown$: Observable<boolean> = this.store$.select(selectWasWelcomeNotificationShown)
		.pipe(
			take(1),
		);

	mainText$: Observable<string> = this.store$.select(selectGeoFilterType).pipe(
		map((geoFilterType: CaseGeoFilter) =>
			geoFilterType === CaseGeoFilter.ScreenView ? this.config.screenViewMainText : this.config.mainText
		)
	);

	constructor(public store$: Store<any>,
				public elem: ElementRef,
				@Inject(mapFacadeConfig) public packageConfig: IMapFacadeConfig) {
		this.config = this.packageConfig.welcomeNotification;
	}

	// Mark as done, in the store, when losing focus (after a delay, to display a fading animation, before this element is destroyed)
	@HostListener('blur')
	onBlur() {
		setTimeout(() => {
			this.store$.dispatch(new SetWasWelcomeNotificationShownFlagAction(true));
		}, 1000);
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
