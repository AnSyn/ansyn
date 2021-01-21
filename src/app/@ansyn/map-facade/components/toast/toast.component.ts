import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectToastMessage } from '../../reducers/map.reducer';
import { IToastMessage, SetToastMessageAction } from '../../actions/map.actions';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';

const animations: any[] = [
	trigger('toastAnimation_rtl', [
		transition(':enter', [style({
			opacity: 0,
			transform: 'translate(-100%, 0)'
		}), animate('0.2s', style({ opacity: 1, transform: 'translate(0, 0)' }))]),
		transition(':leave', [style({ opacity: 1, transform: 'translate(0, 0)' }), animate('0.4s', style({
			opacity: 0,
			transform: 'translate(-100%, 0)'
		}))])
	]),
];

@Component({
	selector: 'ansyn-toast',
	templateUrl: './toast.component.html',
	styleUrls: ['./toast.component.less'],
	animations
})

@AutoSubscriptions()
export class ToastComponent implements OnInit, OnDestroy {
	@Input() duration: number;
	buttonToDisplay: string;
	toastMessageFromState: IToastMessage;

	timeoutRef;

	toastMessage$ = this.store$.select(selectToastMessage);
	durationToButtonPopUp = 10000;

	@AutoSubscription
	updateToatsMessage$ = (<Observable<any>>this.toastMessage$).subscribe((toastMessage: IToastMessage) => {
		this.toastMessageFromState = toastMessage;
	});
	constructor(
		protected store$: Store<any>,
	) {
	}
	ngOnDestroy(): void {
	}

	ngOnInit() {
		(<Observable<any>>this.toastMessage$).subscribe((toastMessage: IToastMessage) => {
			if (toastMessage) { // Hide toast in duration time
				let duration = this.duration * 1000;
				if (toastMessage.buttonToDisplay) {
					this.buttonToDisplay = toastMessage.buttonToDisplay;
					duration = this.durationToButtonPopUp;
				}
				this.timeoutRef = setTimeout(this.closeToast.bind(this), duration);
			} else { // Cancel the last hide
				this.store$.dispatch(new SetToastMessageAction());
				clearTimeout(this.timeoutRef);
			}
		});
	}

	closeToast() {
		this.store$.dispatch(new SetToastMessageAction());
	}

	functionTodo() {
		if (this.toastMessageFromState && this.toastMessageFromState.functionToExcute) {
			this.toastMessageFromState.functionToExcute();
			this.closeToast();
		}
	}
}
