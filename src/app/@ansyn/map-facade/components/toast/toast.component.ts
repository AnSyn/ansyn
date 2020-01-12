import { Component, Input, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { IMapState, selectToastMessage } from '../../reducers/map.reducer';
import { IToastMessage, SetToastMessageAction } from '../../actions/map.actions';

const animations: any[] = [
	trigger('toastAnimation', [
		transition(':enter', [style({
			opacity: 0,
			transform: 'translate(0, 100%)'
		}), animate('0.2s', style({ opacity: 1, transform: 'translate(0, 0)' }))]),
		transition(':leave', [style({ opacity: 1, transform: 'translate(0, 0)' }), animate('0.2s', style({
			opacity: 0,
			transform: 'translate(0, 100%)'
		}))])
	])
];

@Component({
	selector: 'ansyn-toast',
	templateUrl: './toast.component.html',
	styleUrls: ['./toast.component.less'],
	animations
})
export class ToastComponent implements OnInit {
	@Input() duration: number;

	timeoutRef;

	toastMessage$ = this.store$.select(selectToastMessage);

	constructor(protected store$: Store<IMapState>) {
	}

	ngOnInit() {
		(<Observable<any>>this.toastMessage$).subscribe((toastMessage: IToastMessage) => {
			if (toastMessage) { // Hide toast in duration time
				const duration = this.duration * 1000;
				this.timeoutRef = setTimeout(this.closeToast.bind(this), duration);
			} else { // Cancel the last hide
				clearTimeout(this.timeoutRef);
			}
		});
	}

	closeToast() {
		this.store$.dispatch(SetToastMessageAction());
	}
}
