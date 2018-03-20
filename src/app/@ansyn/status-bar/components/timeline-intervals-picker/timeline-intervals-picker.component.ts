import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { CaseIntervalCriteria, CaseIntervalCriteriaType, CaseTimeState } from '@ansyn/core';

interface ITimeFrame {
	from: Date,
	to: Date
}

const HOUR_MILLISECONDS = 60 * 60 * 1000;

@Component({
	selector: 'ansyn-timeline-intervals-picker',
	templateUrl: './timeline-intervals-picker.component.html',
	styleUrls: ['./timeline-intervals-picker.component.less']
})

export class TimelineIntervalsPickerComponent {
	public timeIntervalAdvancedOptions = false;
	public timeFrame: 'last' | 'scope' = 'last';
	public timeIntervalFilterStrategy: 'best' | 'closest' = 'best';
	public timeFilterUnits = {
		options: [
			{ text: 'hours', 	textSingular: 'hour', 	value: HOUR_MILLISECONDS },
			{ text: 'days', 	textSingular: 'day', 	value: HOUR_MILLISECONDS * 24 },
			{ text: 'months', 	textSingular: 'month', 	value: HOUR_MILLISECONDS * 24 * 30 },
			{ text: 'years', 	textSingular: 'year', 	value: HOUR_MILLISECONDS * 24 * 30 * 12 }
		],
		map: new Map()
	};
	// hour, 5 hours, 12 hours, 2 days, 3 days, week, month, 2 months.
	public bestWithin = {
		options: [
			{ text: 'hour', 	valid: true, 	value: HOUR_MILLISECONDS },
			{ text: '5 hours', 	valid: true, 	value: HOUR_MILLISECONDS * 5 },
			{ text: '12 hours', valid: true, 	value: HOUR_MILLISECONDS * 12 },
			{ text: '2 days', 	valid: true, 	value: HOUR_MILLISECONDS * 24 * 2},
			{ text: '3 days', 	valid: true, 	value: HOUR_MILLISECONDS * 24 * 3 },
			{ text: 'week', 	valid: true, 	value: HOUR_MILLISECONDS * 24 * 7 },
			{ text: 'month', 	valid: true, 	value: HOUR_MILLISECONDS * 24 * 30 },
			{ text: '2 months', valid: true, 	value: HOUR_MILLISECONDS * 24 * 30 * 2 }
		],
		validOptions: [],
	};

	public validation = {
		timeFrameErr: null,
		BestWithinErr: null,
		reset: function () {
			this.timeFrameErr  = null;
			this.BestWithinErr = null;
		},
		isValid: function () {
			return this.timeFrameErr  === null && this.BestWithinErr === null;
		}
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

	private _currentTimeState: CaseTimeState;
	@Input()
	set currentTimeState(value) {
		this._currentTimeState = value;
		if (this._currentTimeState && this._currentTimeState.intervals) {
			this.loadCurrentTimeState();
		}
	};
	@Output() applyDate = new EventEmitter<CaseTimeState>();
	@Output('closeComponent') closeComponent = new EventEmitter();

	constructor() {
		// init map for easy search in timeFilterUnits.options
		this.timeFilterUnits.options.forEach(unit => {
			this.timeFilterUnits.map.set(unit.text, unit.value);
			this.timeFilterUnits.map.set(unit.textSingular, unit.value);
			this.timeFilterUnits.map.set(unit.value, unit.text);
		});
		// init values
		this.loadDefaultValues();
	}

	// load data from state
	loadCurrentTimeState() {
		const interval: number = this._currentTimeState.intervals.interval;
		const timeFrame = this._currentTimeState.to.getTime() - this._currentTimeState.from.getTime();
		const criteria: CaseIntervalCriteria = this._currentTimeState.intervals.criteria;

		const inBasicMode = this.timeFilterUnits.map.get(interval) &&
			this.timeFilterUnits.map.get(interval) &&
			criteria.type === 'closest-both';

		if (inBasicMode) {
			this.basicOptionInterval = interval;
			this.basicOptionTimeFrame = timeFrame;
		}

		this.timeIntervalAdvancedOptions = !inBasicMode;
		this.loadAdvancedOptionInterval(interval);
		this.loadAdvancedOptionTimeFrame(this._currentTimeState.from, this._currentTimeState.to);
		this.loadAdvancedOptionCriteria(criteria);

		this.timeIntervalAdvancedOptions = !inBasicMode;
		this.calculateBestWithin();
	}
	// load data from state - interval
	loadAdvancedOptionInterval(interval: number) {
		this.advancedOptionInterval.years = Math.floor(interval / this.timeFilterUnits.map.get('year'));
		this.advancedOptionInterval.months = Math.floor(interval  / this.timeFilterUnits.map.get('month')) % 12;
		this.advancedOptionInterval.days = Math.floor(interval  / this.timeFilterUnits.map.get('day')) % 30;
		this.advancedOptionInterval.hours = Math.floor(interval  / this.timeFilterUnits.map.get('hour')) % 24;
	}
	// load data from state - time frame
	loadAdvancedOptionTimeFrame(from: Date, to: Date) {
		this.advancedOptionStartDate = from;
		this.advancedOptionEndDate = to;
		this.setTimeFrameType('scope');
	}
	// load data from state - criteria
	loadAdvancedOptionCriteria(criteria: CaseIntervalCriteria) {
		if (criteria.type === 'best') {
			this.advancedOptionCriteriaBest.before = criteria.before;
			this.advancedOptionCriteriaBest.after = criteria.after;
			this.timeIntervalFilterStrategy = 'best';
		} else {
			this.timeIntervalFilterStrategy = 'closest';
			this.advancedOptionCriteriaClosest = criteria.type;
		}
	}

	loadDefaultValues() {
		this.basicOptionInterval = this.timeFilterUnits.map.get('month');
		this.basicOptionTimeFrame = this.timeFilterUnits.map.get('year');
		this.advancedOptionInterval.months = 1;
		this.advancedOptionTimeFrameLast = 1;
		this.advancedOptionTimeFrameUnits = this.timeFilterUnits.map.get('year');
		this.advancedOptionCriteriaBest.before = this.timeFilterUnits.map.get('hour');
		this.advancedOptionCriteriaBest.after = this.timeFilterUnits.map.get('hour');
		this.calculateBestWithin();
	}

	calculateBestWithin() {
		const interval: number = this.getTimeInterval();
		this.bestWithin.validOptions = [];

		this.bestWithin.options.forEach(o => {
			if (o.value < interval) {
				this.bestWithin.validOptions.push(o);
			}
		});
	}

	toggleIntervalAdvancedOptions() {
		this.timeIntervalAdvancedOptions = !this.timeIntervalAdvancedOptions;
		this.calculateBestWithin();
	}

	setTimeFrameType(type) {
		this.timeFrame = type;
	}

	setIntervalsFilterStrategy(type) {
		this.timeIntervalFilterStrategy = type;
	}

	checkValidation(): boolean {
		const interval: number = this.getTimeInterval();
		const timeFrame = this.getTimeFrame();
		const criteria: CaseIntervalCriteria = this.getCriteria();

		this.validation.reset();

		// check time frame
		const timeFrameMs = timeFrame.to.getTime() - timeFrame.from.getTime();

		if (timeFrameMs <= 0) {
			this.validation.timeFrameErr = 'Start time exceeds End time';
		} else if (timeFrameMs <= interval) {
			this.validation.timeFrameErr = 'Time frame smaller than interval size';
		}

		// check best within
		// both before and after property exist and have number values
		if (!isNaN(criteria.before + criteria.after)) {
			if ((criteria.before + criteria.after) > interval) {
				this.validation.BestWithinErr = 'Criteria range bigger exceeds interval size';
			}
		}

		return this.validation.isValid();
	}

	applyIntervalPickerEvent() {
		if (!this.checkValidation()) {
			return;
		}

		const interval: number = this.getTimeInterval();
		const timeFrame = this.getTimeFrame();
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

	getTimeFrame(): ITimeFrame {
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
		// advanced mode
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
