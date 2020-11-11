import { Component, OnInit, OnDestroy, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { OwlDateTimeComponent } from '@ansyn/ng-pick-datetime';
import { SetOverlaysCriteriaAction } from '../../../overlays/actions/overlays.actions';
import { SetToastMessageAction } from '@ansyn/map-facade';
import { toastMessages } from '../../../core/models/toast-messages';

@Component({
	selector: 'ansyn-timepicker',
	templateUrl: './time-picker.component.html',
	styleUrls: ['./time-picker.component.less']
})
export class TimePickerComponent implements OnInit, OnDestroy {
	requestAnimation;
	@Input() timeRange: Date[];
	@Output() closeTimePicker = new EventEmitter();
	@ViewChild('dt') datePicker: OwlDateTimeComponent<any>;
	@ViewChild('trigger') trigger: any;
	constructor(protected store$: Store<any>) {
	}

	onTimeRangeChange([from, to]) {
		if (this.validateDate(from) && this.validateDate(to)) {
			this.store$.dispatch(new SetOverlaysCriteriaAction({ time: { from, to } }));
		} else {
			this.store$.dispatch(new SetToastMessageAction({ toastText: toastMessages.notSupportRangeDates }));
		}
	}

	private validateDate(date: Date) {
		return date.getFullYear() >= 1970 && date.getTime() <= Date.now();
	}

	ngOnInit() {
		if (this.requestAnimation) {
			cancelAnimationFrame(this.requestAnimation);
		}
		requestAnimationFrame(() => this.datePicker.open());
	}
	ngOnDestroy(): void {
	}

	afterClosed() {
		this.closeTimePicker.emit();
	}
}
