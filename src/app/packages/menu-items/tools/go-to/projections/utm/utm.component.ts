import { Component, EventEmitter, forwardRef, Output } from '@angular/core';
import {
	AbstractControl,
	ControlValueAccessor,
	NG_VALIDATORS,
	NG_VALUE_ACCESSOR,
	ValidationErrors,
	Validator
} from '@angular/forms';
import { isEqual as _isEqual } from 'lodash';
import { ProjectionConverterService } from '@ansyn/core/services/projection-converter.service';

@Component({
	selector: 'ansyn-utm',
	templateUrl: './utm.component.html',
	styleUrls: ['./utm.component.less'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => UtmComponent),
			multi: true
		},
		{
			provide: NG_VALIDATORS,
			useExisting: forwardRef(() => UtmComponent),
			multi: true
		}
	]
})

export class UtmComponent implements ControlValueAccessor, Validator {
	@Output() copyToClipBoardHandler = new EventEmitter();

	coordinates: number[] = [0, 0, 0];
	validationErr: ValidationErrors = null;

	onChanges = (value) => {
	};

	onBlur = () => {
	};

	writeValue(newValue: number[]): void {
		if (newValue && !_isEqual(newValue, this.coordinates)) {
			this.coordinates = newValue.map(num => Math.floor(num));
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
		this.copyToClipBoardHandler.emit(this.coordinates.join(' '));
	}

	validate(c: AbstractControl): ValidationErrors {
		if (!c.value) {
			this.validationErr = { empty: true };
			return this.validationErr;
		}
		const someNotNumber = c.value.some(value => typeof value !== 'number');
		if (someNotNumber) {
			this.validationErr = { empty: true };
		} else if (!ProjectionConverterService.isValidUTM(c.value)) {
			this.validationErr = { invalid: true };
		} else {
			this.validationErr = null;
		}
		return this.validationErr;
	}

}
