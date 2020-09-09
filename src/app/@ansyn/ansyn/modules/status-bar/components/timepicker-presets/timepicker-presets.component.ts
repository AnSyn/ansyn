import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ICaseTimeState } from '../../../menu-items/cases/models/case.model';
import { SetOverlaysCriteriaAction } from '../../../overlays/actions/overlays.actions';
import { Store } from '@ngrx/store';
import { LoggerService } from '../../../core/services/logger.service';

@Component({
	selector: 'ansyn-timepicker-presets',
	templateUrl: './timepicker-presets.component.html',
	styleUrls: ['./timepicker-presets.component.less'],
})

export class TimepickerPresetsComponent implements OnInit, OnDestroy {

	@Output() hideMe = new EventEmitter<boolean>();
	@Output() openTimePicker = new EventEmitter<boolean>();
	presets = [7, 30, 60, 365, 5 * 365];

	constructor(
		protected store$: Store<any>,
		protected loggerService: LoggerService
	) {
	}

	setPreset(preset: number) {
		const currentDate = new Date();
		let from = new Date();
		from.setDate(from.getDate() - preset);

		const time: ICaseTimeState = {
			from,
			to: currentDate,
		};

		this.loggerService.info(`User selected time preset = ${this.presetValue(preset)} ${this.presetTitle(preset)}`, 'OVERLAYS', 'SEARCH_OVERLAYS_BY_TIME_PRESET');
		this.store$.dispatch(new SetOverlaysCriteriaAction({ time }));
		this.closePresets();
	}

	presetValue(preset: number): number {
		return (preset < 365) ? preset : preset / 365;
	}

	presetTitle(preset: number): string {
		return  (preset < 365) ? 'days ago' : 'years ago';
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
