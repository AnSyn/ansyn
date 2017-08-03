import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, ValidationErrors, AbstractControl, Validator } from '@angular/forms';
import { isEqual as _isEqual} from 'lodash';

const providers = [
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

];

@Component({
	selector: 'ansyn-geo',
	templateUrl: './geo.component.html',
	styleUrls: ['./geo.component.less'],
	providers
})

export class GeoComponent implements ControlValueAccessor, Validator {
	coordinates: number[] = [0,0];
	onChanges = (value)  => {};
	onBlur = () => {};

	writeValue(newValue: number[]): void {
		if(newValue && !_isEqual(newValue, this.coordinates)){
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

	validate(c: AbstractControl): ValidationErrors {
		const lng = c.value[0];
		const lat = c.value[1];
		if (!lng || !lat) {
			return {empty: true}
		} else if( ( lng < -180 || 180 < lng ) ||  ( lat < -90 || 90 < lat )) {
			return {invalid: true}
		}
		return null;
	}
}
