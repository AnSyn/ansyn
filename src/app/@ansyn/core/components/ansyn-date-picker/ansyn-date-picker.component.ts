import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import * as flatpickr from 'flatpickr';

@Component({
	selector: 'ansyn-date-picker',
	templateUrl: './ansyn-date-picker.component.html',
	styleUrls: ['./ansyn-date-picker.component.less']
})

export class DatePickerComponent implements OnInit {

	private _datePickerValue: Date;
	private _datePickerInstance: any;

	@ViewChild('datePicker') datePicker: ElementRef;
	@Output() dateChange = new EventEmitter<Date>();

	@Input() disabled = false;

	@Input()
	set date(val) {
		this._datePickerValue = val;
		if (this._datePickerInstance) {
			this._datePickerInstance.setDate(this._datePickerValue, false);
		}
	}

	constructor() {}

	ngOnInit() {
		// see API: https://flatpickr.js.org/options/
		this._datePickerInstance = new (<any>flatpickr)(this.datePicker.nativeElement, {
			// id: 'end',
			time_24hr: true,
			enableTime: true,
			dateFormat: 'H:i d/m/Y',
			defaultDate: this._datePickerValue ? this._datePickerValue : new Date(),
			onChange: this.onDateChange.bind(this),
			plugins: [this.confirmDatePlugin({})]
		});
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

	onDateChange(event) {
		if (this.disabled) {
			return false;
		}
		this._datePickerValue = event[0];
		this.dateChange.emit(this._datePickerValue);
	}
}
