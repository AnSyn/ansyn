import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Observable, combineLatest, fromEvent } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { animate, style, transition, trigger } from '@angular/animations';
import { IOverlaysState, selectLoading, selectStatusMessage } from '../../reducers/overlays.reducer';
import { SetOverlaysStatusMessage } from '../../actions/overlays.actions';
import { AutoSubscriptions, AutoSubscription } from 'auto-subscriptions';
import { map, take, tap, distinctUntilChanged, takeWhile } from 'rxjs/operators';

const animations: any[] = [
	trigger('timeline-status', [
		transition(':enter', [
			style({ opacity: 0 }),
			animate('0.2s', style({ opacity: 1 }))
		]),
		transition(':leave', [
			style({ opacity: 1 }),
			animate('0.2s', style({ opacity: 0 }))
		])
	])
];

@Component({
	selector: 'ansyn-overlay-status',
	templateUrl: './overlay-status.component.html',
	styleUrls: ['./overlay-status.component.less'],
	animations
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class OverlayStatusComponent implements OnInit, OnDestroy {
	showStatus: boolean;

	overlaysStatusMessage$: Observable<any> = this.store$.pipe(
		select(selectStatusMessage)
	);

	overlaysLoader$: Observable<any> = this.store$.pipe(
		select(selectLoading)
	);

	@AutoSubscription
	showStatus$: any = combineLatest(this.overlaysStatusMessage$, this.overlaysLoader$).pipe(
		map(([statusMessage, loading]) => Boolean(statusMessage && !loading)),
		distinctUntilChanged(),
		tap((showStatus: boolean) => {
			this.showStatus = showStatus;
			if (this.showStatus) {
				fromEvent(document, 'click').pipe(
					takeWhile(() => this.showStatus),
					tap(() => this.close())
				).subscribe();
			}
	}));

	constructor(protected store$: Store<IOverlaysState>) {
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}

	close() {
		this.store$.dispatch(new SetOverlaysStatusMessage(null));
	}
}
