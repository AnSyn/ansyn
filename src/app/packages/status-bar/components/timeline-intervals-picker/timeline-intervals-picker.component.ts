import { Component, EventEmitter, Output } from '@angular/core';

import { CaseIntervalCriteria, CaseIntervalCriteriaType, CaseTimeState } from '@ansyn/core';

const HOUR_MILLISECONDS = 60 * 60 * 1000;

@Component({
	selector: 'ansyn-timeline-intervals-picker',
	templateUrl: './timeline-intervals-picker.component.html',
	styleUrls: ['./timeline-intervals-picker.component.less']
})

export class TimelineIntervalsPickerComponent {
	timeIntervalAdvancedOptions = false;
	timeFrame: 'last' | 'scope' = 'last';
	timeIntervalFilterStrategy: 'best' | 'closest' = 'best';
	timeFilterUnits = {
		options: [
			{ text: 'hours', 	textSingular: 'hour', 	value: HOUR_MILLISECONDS },
			{ text: 'days', 	textSingular: 'day', 	value: HOUR_MILLISECONDS * 24 },
			{ text: 'months', 	textSingular: 'month', 	value: HOUR_MILLISECONDS * 24 * 30 },
			{ text: 'years', 	textSingular: 'year', 	value: HOUR_MILLISECONDS * 24 * 30 * 12 }
		],
		map: new Map()
	};

	public basicOptionInterval: number;
	public basicOptionTimeFrame: number;
	public advancedOptionInterval = {years: 0, months: 0, days: 0 , hours: 0 };
	public advancedOptionTimeFrameLast: number;
	public advancedOptionTimeFrameUnits: number;
	public advancedOptionStartDate = new Date(new Date().getTime() - HOUR_MILLISECONDS * 24 * 365);	// default is 1 yr ago
	public advancedOptionEndDate = new Date();
	public advancedOptionCriteriaBest = { before: 0, after: 0};
	public advancedOptionCriteriaClosest = 'closest-before';

	@Output() applyDate = new EventEmitter<CaseTimeState>();
	@Output('closeComponent') closeComponent = new EventEmitter();

	constructor() {
		// init map for easy search in timeFilterUnits.options
		this.timeFilterUnits.options.forEach(unit => {
			this.timeFilterUnits.map.set(unit.text, unit.value);
			this.timeFilterUnits.map.set(unit.textSingular, unit.value)
		});
		// init values
		this.basicOptionInterval = this.timeFilterUnits.map.get('month');
		this.basicOptionTimeFrame = this.timeFilterUnits.map.get('year');
		this.advancedOptionInterval.months = 1;
		this.advancedOptionTimeFrameLast = 1;
		this.advancedOptionCriteriaBest.before = this.timeFilterUnits.map.get('hour');
		this.advancedOptionCriteriaBest.after = this.timeFilterUnits.map.get('hour');
		this.advancedOptionTimeFrameUnits = this.timeFilterUnits.map.get('year');
	}

	toggleIntervalAdvancedOptions() {
		this.timeIntervalAdvancedOptions = !this.timeIntervalAdvancedOptions;
	}

	setTimeFrameType(type) {
		this.timeFrame = type;
	}

	setIntervalsFilterStrategy(type) {
		this.timeIntervalFilterStrategy = type;
	}

	applyIntervalPickerEvent() {
		// if (this.advancedOptionStartDatePickerValue.getTime() >= this.advancedOptionEndDatePickerValue.getTime()) {
		// if invalid
		if (false) {
			// this.error = '* error';
			// return;
		}
		const timeFrame = this.getTimeFrame();
		const interval: number = this.getTimeInterval();
		const criteria: CaseIntervalCriteria = this.getCriteria();

		const intervalsData: CaseTimeState = {
			type: 'absolute',
			from: timeFrame.from,
			to: timeFrame.to,
			intervals: {
				interval,
				criteria
			}
		};

		this.applyDate.emit(intervalsData);
	}
	getTimeFrame(): { from: Date, to: Date } {
		let from;
		let to = new Date();	// default is 'now'

		// basic mode
		if (this.timeIntervalAdvancedOptions === false) {
			from = new Date(to.getTime() - this.basicOptionTimeFrame);
		} else {
			// advanced mode
			if (this.timeFrame === 'last') {
				// advanced mode: time frame > last
				from = new Date(to.getTime() - this.advancedOptionTimeFrameLast * this.advancedOptionTimeFrameUnits);
			} else {
				// advanced mode: time frame > start - end
				from = this.advancedOptionStartDate;
				to = this.advancedOptionEndDate;
			}
		}

		return { from, to };
	}

	getTimeInterval(): number {
		let interval;
		// basic mode
		if (this.timeIntervalAdvancedOptions === false) {
			interval = this.basicOptionInterval;
		} else {
			// advanced mode
			interval =
				this.advancedOptionInterval.years * this.timeFilterUnits.map.get('years') +
				this.advancedOptionInterval.months * this.timeFilterUnits.map.get('months') +
				this.advancedOptionInterval.days * this.timeFilterUnits.map.get('days') +
				this.advancedOptionInterval.hours * this.timeFilterUnits.map.get('hours');
		}
		return +interval;
	}

	getCriteria(): CaseIntervalCriteria {
		let criteria: CaseIntervalCriteria = {
			type: 'closest-both'	// default for basic mode
		};
		// basic mode
		if (this.timeIntervalAdvancedOptions) {
			if (this.timeIntervalFilterStrategy === 'best') {
				// advanced mode: Criteria > best
				criteria.type = 'best';
				criteria.before = +this.advancedOptionCriteriaBest.before;
				criteria.after = +this.advancedOptionCriteriaBest.after;
			} else {
				// advanced mode: Criteria > closest
				criteria.type = <CaseIntervalCriteriaType>this.advancedOptionCriteriaClosest;
			}
		}
		return criteria;
	}
}
