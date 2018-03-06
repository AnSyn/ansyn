import { Component, EventEmitter, Output } from '@angular/core';

import { CaseTimeState } from '@ansyn/core';

const HOUR_MILLISECONDS = 60 * 60 * 1000;

@Component({
	selector: 'ansyn-timeline-intervals-picker',
	templateUrl: './timeline-intervals-picker.component.html',
	styleUrls: ['./timeline-intervals-picker.component.less']
})

export class TimelineIntervalsPickerComponent {
	timeIntervalAdvancedOptions = false;
	timeFrame = 'last';
	timeIntervalFilterStrategy = 'best';
	timeFilterUnits = [
		{ text: 'hours', 	value: HOUR_MILLISECONDS },
		{ text: 'days', 	value: HOUR_MILLISECONDS * 24},
		{ text: 'months', 	value: HOUR_MILLISECONDS * 24 * 30 },
		{ text: 'years', 	value: HOUR_MILLISECONDS * 24 * 30 * 12 }
	];


	@Output() applyDate = new EventEmitter<CaseTimeState>();
	@Output('closeComponent') closeComponent = new EventEmitter();

	toggleIntervalAdvancedOptions() {
		this.timeIntervalAdvancedOptions = !this.timeIntervalAdvancedOptions;
	}

	setTimeFrameType(type) {
		this.timeFrame = type;
	}

	setIntervalsFilterStrategy(type) {
		this.timeIntervalFilterStrategy = type;
	}
}
