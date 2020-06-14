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
	presets = [7, 30, 60, 365, 5 * 365];

	constructor(protected store$: Store<any>) {
	}

	setPreset(preset: number) {
		const currentDate = new Date();
		let from = new Date();
		from.setDate(from.getDate() - preset);

		const time: ICaseTimeState = {
			from,
			to: currentDate,
		};

		this.store$.dispatch(new SetOverlaysCriteriaAction({ time }));
		this.closePresets();
	}

	presetTitle(preset: number) {
		return (preset < 365) ? `${preset} days ago` : `${preset / 365} years ago`
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
