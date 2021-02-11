import { Component, OnInit, OnDestroy, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { OwlDateTimeComponent } from '@ansyn/ng-pick-datetime';
import { SetToastMessageAction } from '@ansyn/map-facade';
import { toastMessages } from '../../../core/models/toast-messages';
import { UpdateCalendarStatusAction, SearchAction } from '../../actions/status-bar.actions';

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
			this.store$.dispatch(new SearchAction({ time: { from, to } }));
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
		this.store$.dispatch(new UpdateCalendarStatusAction(true));
	}
	ngOnDestroy(): void {
		this.store$.dispatch(new UpdateCalendarStatusAction(false));
	}

	afterClosed() {
		this.closeTimePicker.emit();
	}
}
