import { Component, forwardRef, Input } from '@angular/core';
import { UUID } from 'angular2-uuid';
import {
	AbstractControl,
	ControlValueAccessor,
	NG_VALIDATORS,
	NG_VALUE_ACCESSOR,
	ValidationErrors,
	Validator,
	Validators
} from '@angular/forms';
import { noop } from 'rxjs';

@Component({
	selector: 'ansyn-checkbox',
	templateUrl: './ansyn-checkbox.component.html',
	styleUrls: ['./ansyn-checkbox.component.less'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => AnsynCheckboxComponent),
			multi: true
		},
		{
			provide: NG_VALIDATORS,
			useExisting: forwardRef(() => AnsynCheckboxComponent),
			multi: true
		}
	]
})

export class AnsynCheckboxComponent implements ControlValueAccessor, Validator {
	@Input() id = UUID.UUID();
	@Input() required;
	@Input() name: string;
	disabled: boolean;

	protected _value;
	private onTouchedCallback: () => void = noop;
	private onChangeCallback: (_: any) => void = noop;

	set value(value: boolean) {
		if (this.value !== value) {
			this._value = value;
			this.onChangeCallback(value);
		}
	}

	get value() {
		return this._value;
	}

	writeValue(value: boolean): void {
		if (this.value !== value) {
			this._value = value;
		}
	}

	registerOnChange(fn: any) {
		this.onChangeCallback = fn;
	}

	registerOnTouched(fn: any) {
		this.onTouchedCallback = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		this.disabled = isDisabled;
	}

	validate(c: AbstractControl): ValidationErrors | null {
		if (this.required !== undefined) {
			return Validators.requiredTrue(<any>this);
		}
		return null;
	}
}
