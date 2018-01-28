import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import * as flatpickr from 'flatpickr';

@Component({
	selector: 'ansyn-timeline-timepicker',
	templateUrl: './timeline-timepicker.component.html',
	styleUrls: ['./timeline-timepicker.component.less']
})

export class TimelineTimepickerComponent implements OnInit {

	private _startDatePickerValue = new Date(new Date().getTime() - 3600000 * 24 * 365);
	private _endDatePickerValue = new Date();

	endDatePickerInstance: any;
	startDatePickerInstance: any;
	error: string;

	@ViewChild('startDatePicker') startDatePicker: ElementRef;
	@ViewChild('endDatePicker') endDatePicker: ElementRef;

	@Output('applyDate') applyDate = new EventEmitter();
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
	}

	selectedDateChanged(date: Date, dateString: string, instance: any) {
		this.error = '';
		if (instance.config.id === 'start') {
			this.startDatePickerValue = new Date(date[0]);
		} else {
			this.endDatePickerValue = new Date(date[0]);
		}
	}

	confirmDatePlugin(pluginConfig: any) {
		const defaultConfig = {
			confirmIcon: '<svg version=\'1.1\' xmlns=\'http://www.w3.org/2000/svg\' xmlns:xlink=\'http://www.w3.org/1999/xlink\' width=\'17\' height=\'17\' viewBox=\'0 0 17 17\'> <g> </g> <path d=\'M15.418 1.774l-8.833 13.485-4.918-4.386 0.666-0.746 4.051 3.614 8.198-12.515 0.836 0.548z\' fill=\'#000000\' /> </svg>',
			confirmText: 'OK ',
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
			start: this.startDatePickerValue,
			end: this.endDatePickerValue
		});
	}
}
