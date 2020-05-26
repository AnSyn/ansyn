import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ICaseTimeState } from '../../../menu-items/cases/models/case.model';
import { SetOverlaysCriteriaAction } from '../../../overlays/actions/overlays.actions';
import { Store } from '@ngrx/store';

@Component({
	selector: 'ansyn-timepicker-presets',
	templateUrl: './timepicker-presets.component.html',
	styleUrls: ['./timepicker-presets.component.less'],
})

export class TimepickerPresetsComponent implements OnInit, OnDestroy {

	@Output() hideMe = new EventEmitter<boolean>();
	@Output() openTimePicker = new EventEmitter<boolean>();
	presetsDays = [7, 30, 60];


	constructor(protected store$: Store<any>) {
	}

	setPreset(days: number) {
		const currentDate = new Date();
		let from = new Date();
		from.setDate(from.getDate() - days);

		const time: ICaseTimeState = {
			from,
			to: currentDate,
			type: 'absolute'
		};

		this.store$.dispatch(new SetOverlaysCriteriaAction({ time }));
		this.closePresets();
	}

	closePresets() {
		this.hideMe.emit();
	}

	toggleTimePicker() {
		this.openTimePicker.emit();
	}

	ngOnInit() {
	}

	ngOnDestroy() {
	}

}
