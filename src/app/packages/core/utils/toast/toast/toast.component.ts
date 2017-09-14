import { Component, EventEmitter, Input, Output } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

const animations: any[] = [
	trigger('toastAnimation', [
		transition(':enter', [style({
			opacity: 0,
			transform: 'translate(0, 100%)'
		}), animate('0.2s', style({opacity: 1, transform: 'translate(0, 0)'}))]),
		transition(':leave', [style({opacity: 1, transform: 'translate(0, 0)'}), animate('0.2s', style({
			opacity: 0,
			transform: 'translate(0, 100%)'
		}))]),
	])
];

@Component({
	selector: 'ansyn-toast',
	templateUrl: './toast.component.html',
	styleUrls: ['./toast.component.less'],
	animations
})
export class ToastComponent {
	private _showToast;
	timeoutRef;

	@Input() text: string;
	@Input() duration: number;
	@Output() showToastChange = new EventEmitter();


	@Input()
	set showToast(value) {

		this.showToastChange.emit(value);

		if (value) {
			this.timeoutRef = setTimeout(() => {
				this.showToastChange.emit(false);

			}, this.duration * 1000);
		} else {
			clearTimeout(this.timeoutRef);
		}

		this._showToast = value;
	};

	get showToast() {
		return this._showToast;
	}

}
