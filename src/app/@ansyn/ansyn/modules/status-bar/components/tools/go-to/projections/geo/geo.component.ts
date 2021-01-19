import { Component, EventEmitter, forwardRef, HostBinding, Input, Output } from '@angular/core';
import {
	AbstractControl,
	ControlValueAccessor,
	NG_VALIDATORS,
	NG_VALUE_ACCESSOR,
	ValidationErrors,
	Validator
} from '@angular/forms';
import { isEqual as _isEqual } from 'lodash';
import { ProjectionConverterService } from '@ansyn/map-facade';


@Component({
	selector: 'ansyn-geo-wgs',
	templateUrl: './geo.component.html',
	styleUrls: ['./geo.component.less'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => GeoComponent),
			multi: true
		},
		{
			provide: NG_VALIDATORS,
			useExisting: forwardRef(() => GeoComponent),
			multi: true
		}
	]
})

export class GeoComponent implements ControlValueAccessor, Validator {
	@Output() copyToClipBoardHandler = new EventEmitter();
	@HostBinding('class.rtl')
	@Input() isRTL = true;

	coordinates: number[] = [0, 0];
	validationErr: ValidationErrors = null;

	onChanges = (value) => {
	};

	onBlur = () => {
	};

	writeValue(newValue: number[]): void {
		if (newValue && !_isEqual(newValue, this.coordinates)) {
			this.coordinates = newValue.map((num) => +num.toFixed(5));
		}
	}

	registerOnChange(fn: any): void {
		this.onChanges = fn;
	}

	registerOnTouched(fn: any): void {
		this.onBlur = fn;
	}

	onInputs(value) {
		this.onChanges([...value]);
	}

	copyToClipBoard() {
		this.copyToClipBoardHandler.emit(`${ this.coordinates[0] } ${ this.coordinates[1] }`);
	}

	validate(c: AbstractControl): ValidationErrors {
		if (!c.value) {
			this.validationErr = { empty: true };
			return this.validationErr;
		}
		const lng = c.value[0];
		const lat = c.value[1];
		if ((lng === null || lng === undefined) || (lat === null || lat === undefined)) {
			this.validationErr = { empty: true };
		} else if (!ProjectionConverterService.isValidGeoWGS84(c.value)) {
			this.validationErr = { invalid: true };
		} else {
			this.validationErr = null;
		}
		return this.validationErr;
	}
}
