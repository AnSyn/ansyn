import { Component, OnInit } from '@angular/core';
import { IOverlaysState, overlaysStateSelector } from '@ansyn/overlays/reducers/overlays.reducer';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { animate, style, transition, trigger } from '@angular/animations';
import { SetOverlaysStatusMessage } from '@ansyn/overlays/actions/overlays.actions';

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
export class OverlayStatusComponent implements OnInit {
	loading: boolean;
	statusMessage: string;

	subscribers: any = {};
	overlaysState$: Observable<IOverlaysState> = this.store$.select(overlaysStateSelector);
	overlaysStatusMessage$: Observable<any> = this.overlaysState$
		.pluck <IOverlaysState, string>('statusMessage')
		.distinctUntilChanged();

	overlaysLoader$: Observable<any> = this.overlaysState$
		.pluck <IOverlaysState, boolean>('loading')
		.distinctUntilChanged();

	constructor(protected store$: Store<IOverlaysState>) {
	}

	ngOnInit(): void {
		this.setStoreSubscribers();
	}

	close() {
		this.store$.dispatch(new SetOverlaysStatusMessage(null));
	}

	setStoreSubscribers(): void {
		this.subscribers.drops = this.overlaysStatusMessage$.subscribe((statusMessage: string) => {
			this.statusMessage = statusMessage;
		});

		this.subscribers.overlaysLoader = this.overlaysLoader$.subscribe(loading => {
			this.loading = loading;
		});
	}
}
