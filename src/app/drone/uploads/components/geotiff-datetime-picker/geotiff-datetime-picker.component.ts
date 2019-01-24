import { Component, ElementRef, Input, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';

declare function require(name: string);

const flatpickr = require('flatpickr');

@Component({
	selector: 'ansyn-geotiff-datetime-picker',
	templateUrl: './geotiff-datetime-picker.component.html',
	styleUrls: ['./geotiff-datetime-picker.component.less']
})
export class GeotiffDatetimePickerComponent implements OnInit {
	@Output() change = new EventEmitter<any>();
	@ViewChild('geotiffDatetimePicker') geoTiffDatetimePicker: ElementRef;
	geoTiffDatetimePickerInstance: any;
	private _geoTiffTimeDateValue = new Date();

	constructor(public elementRef: ElementRef) {
	}

	get geotiffTimeDatePickerValue() {
		return this._geoTiffTimeDateValue;
	}

	@Input()
	set geotiffTimeDatePickerValue(value: Date) {
		this._geoTiffTimeDateValue = value;
		if (this.geoTiffDatetimePickerInstance) {
			this.geoTiffDatetimePickerInstance.setDate(this.geotiffTimeDatePickerValue, false);
		}
	}

	ngOnInit() {
		this.geoTiffDatetimePickerInstance = new (<any>flatpickr)(this.geoTiffDatetimePicker.nativeElement, {
			id: 'geotiffTimedate',
			time_24hr: true,
			enableTime: true,
			maxDate: new Date(),
			dateFormat: 'Y-m-d H:i',
			appendTo: this.elementRef.nativeElement,
			onChange: this.selectedDateChanged.bind(this),
			plugins: [this.confirmDatePlugin({})]
		});

		this.geoTiffDatetimePickerInstance.setDate(this.geotiffTimeDatePickerValue, false);
	}

	selectedDateChanged(date: Date, dateString: string, instance: any) {
		this.geotiffTimeDatePickerValue = new Date(date[0]);
	}

	confirmDatePlugin(pluginConfig: any) {
		const defaultConfig = {
			showAlways: false,
			theme: 'light'
		};

		const config = Object.assign(defaultConfig, pluginConfig);

		return function (fp) {
			return {
				onKeyDown: function onKeyDown(_, __, ___, e) {
					if (fp.config.enableTime && e.key === 'Tab' && e.target === fp.amPM) {
						e.preventDefault();
					}
				},
			} as any;
		};
	}

}
