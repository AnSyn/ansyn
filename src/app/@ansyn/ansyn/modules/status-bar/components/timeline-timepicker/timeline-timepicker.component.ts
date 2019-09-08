import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ICaseTimeState } from '../../../menu-items/cases/models/case.model';

declare function require(name: string);

const flatpickr = require('flatpickr');

// import flatpikr doesn't work


@Component({
	selector: 'ansyn-timeline-timepicker',
	templateUrl: './timeline-timepicker.component.html',
	styleUrls: ['./timeline-timepicker.component.less']
})

export class TimelineTimepickerComponent implements OnInit, OnDestroy {

	private _startDatePickerValue = new Date(new Date().getTime() - 3600000 * 24 * 365);
	private _endDatePickerValue = new Date();

	endDatePickerInstance: any;
	startDatePickerInstance: any;
	error: string;

	@ViewChild('startDatePicker') startDatePicker: ElementRef;
	@ViewChild('endDatePicker') endDatePicker: ElementRef;

	@Output() applyDate = new EventEmitter<ICaseTimeState>();
	@Output('closeComponent') closeComponent = new EventEmitter();

	@Input()
	set startDatePickerValue(value: Date) {
		this._startDatePickerValue = value;
		if (this.startDatePickerInstance) {
			this.startDatePickerInstance.setDate(this.startDatePickerValue, false);
		}
	}

	@Input()
	set endDatePickerValue(value: Date) {
		this._endDatePickerValue = value;
		if (this.endDatePickerInstance) {
			this.endDatePickerInstance.setDate(this.endDatePickerValue, false);
		}
	}

	get startDatePickerValue() {
		return this._startDatePickerValue;
	}

	get endDatePickerValue() {
		return this._endDatePickerValue;
	}

	ngOnInit(): void {
		this.endDatePickerInstance = new (<any>flatpickr)(this.endDatePicker.nativeElement, {
			id: 'end',
			time_24hr: true,
			enableTime: true,
			dateFormat: 'H:i d/m/Y',
			onChange: this.selectedDateChanged.bind(this),
			plugins: [this.confirmDatePlugin({})]
		});

		this.endDatePickerInstance.setDate(this.endDatePickerValue, false);

		this.startDatePickerInstance = new (<any>flatpickr)(this.startDatePicker.nativeElement, {
			id: 'start',
			time_24hr: true,
			enableTime: true,
			dateFormat: 'H:i d/m/Y',
			onChange: this.selectedDateChanged.bind(this),
			plugins: [this.confirmDatePlugin({})]
		});

		this.startDatePickerInstance.setDate(this.startDatePickerValue, false);
		this.startDatePickerInstance.currentYearElement.onmousewheel = (function (event) {
			const delta = event.wheelDelta / Math.abs(event.wheelDelta);
			const year = event.target.valueAsNumber + delta;
			setTimeout(() => this.startDatePickerInstance.changeYear(year), 100);
		}).bind(this);
		this.endDatePickerInstance.currentYearElement.onmousewheel = (function (event) {
			const delta = event.wheelDelta / Math.abs(event.wheelDelta);
			const year = event.target.valueAsNumber + delta;
			setTimeout(() => this.endDatePickerInstance.changeYear(year), 100);
		}).bind(this);
	}

	ngOnDestroy(): void {
		this.endDatePickerInstance.destroy();
		this.startDatePickerInstance.destroy();
	}

	selectedDateChanged(date: Date[], dateString: string, instance: any) {
		this.error = '';
		if (!this.isValidDate(date[0])) {
			return;
		}

		if (instance.config.id === 'start') {
			this.startDatePickerValue = new Date(date[0]);
		} else {
			this.endDatePickerValue = new Date(date[0]);
		}
	}

	isValidDate(date): boolean {
		if (Object.prototype.toString.call(date) === '[object Date]') {
			// it is a date
			if (isNaN(date.getTime())) {  // d.valueOf() could also work
				// date is not valid
				return false;
			} else {
				// date is valid
				return true;
			}
		}
		// not a date
		return false;
	}

	confirmDatePlugin(pluginConfig: any) {
		const defaultConfig = {
			confirmIcon: '<i></i>',
			confirmText: '',
			showAlways: false,
			theme: 'light'
		};

		const config = Object.assign(defaultConfig, pluginConfig);

		return function (fp) {
			const hooks = {
				onKeyDown: function onKeyDown(_, __, ___, e) {
					if (fp.config.enableTime && e.key === 'Tab' && e.target === fp.amPM) {
						e.preventDefault();
						fp.confirmContainer.focus();
					} else if (e.key === 'Enter' && e.target === fp.confirmContainer) {
						fp.close();
					}
				},
				onReady: function onReady() {
					if (fp.calendarContainer === undefined) {
						return;
					}

					fp.confirmContainer = fp._createElement('div', 'flatpickr-confirm ' + (config.showAlways ? 'visible' : '') + ' ' + config.theme + 'Theme', config.confirmText);

					fp.confirmContainer.tabIndex = -1;
					fp.confirmContainer.innerHTML += config.confirmIcon;

					fp.confirmContainer.addEventListener('click', fp.close);
					fp.calendarContainer.appendChild(fp.confirmContainer);
				}
			} as any;

			if (!config.showAlways) {
				hooks.onChange = function (dateObj, dateStr) {
					const showCondition = fp.config.enableTime || fp.config.mode === 'multiple';
					if (dateStr && !fp.config.inline && showCondition) {
						return fp.confirmContainer.classList.add('visible');
					}
					fp.confirmContainer.classList.remove('visible');
				};
			}

			return hooks;
		};
	}


	applyTimepickerEvent() {
		if (this.startDatePickerValue.getTime() >= this.endDatePickerValue.getTime()) {
			this.error = '* error';
			return;
		}
		this.applyDate.emit({
			type: 'absolute',
			from: this.startDatePickerValue,
			to: this.endDatePickerValue
		});
	}
}
