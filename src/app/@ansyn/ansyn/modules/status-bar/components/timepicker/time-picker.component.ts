import { Component, OnInit, OnDestroy, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ICaseTimeState } from '../../../menu-items/cases/models/case.model';
import { Store } from '@ngrx/store';
import { OwlDateTimeComponent } from '@ansyn/ng-pick-datetime';
import { SetOverlaysCriteriaAction } from '../../../overlays/actions/overlays.actions';

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

	onTimeRangeChange(event) {
		const time: ICaseTimeState = {
			from: event.value[0],
			to: event.value[1],
			type: 'absolute'
		};
		this.store$.dispatch(new SetOverlaysCriteriaAction({ time }));
	}

	ngOnInit() {
		if (this.requestAnimation) {
			cancelAnimationFrame(this.requestAnimation);
		}
		requestAnimationFrame(() => this.datePicker.open());
	}
	ngOnDestroy(): void {
	}
}
