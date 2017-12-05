import { Component, EventEmitter, forwardRef, Output } from '@angular/core';
import {
	AbstractControl,
	ControlValueAccessor,
	NG_VALIDATORS,
	NG_VALUE_ACCESSOR,
	ValidationErrors,
	Validator
} from '@angular/forms';
import { isEqual as _isEqual, isNil as _isNil } from 'lodash';
import { ProjectionConverterService } from '@ansyn/core/services/projection-converter.service';


@Component({
	selector: 'ansyn-geo',
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

	coordinates: number[] = [0, 0];

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
		this.copyToClipBoardHandler.emit(`${this.coordinates[1]} ${this.coordinates[0]}`);
	}

	validate(c: AbstractControl): ValidationErrors {
		if (!c.value) {
			return { empty: true };
		}
		const lng = c.value[0];
		const lat = c.value[1];
		if (_isNil(lng) || _isNil(lat)) {
			return { empty: true };
		} else if (!ProjectionConverterService.isValidWGS84(c.value)) {
			return { invalid: true };
		}
		return null;
	}
}
