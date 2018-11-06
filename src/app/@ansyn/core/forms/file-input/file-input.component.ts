import { Component, EventEmitter, forwardRef, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { noop } from 'rxjs';
import { Input } from '@angular/core';

@Component({
	selector: 'ansyn-file-input',
	templateUrl: './file-input.component.html',
	styleUrls: ['./file-input.component.less'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => FileInputComponent),
			multi: true
		}
	]
})
export class FileInputComponent implements ControlValueAccessor {
	@Output() change = new EventEmitter<any>();
	@Input() placeholder = 'Choose file';

	private _value: FileList;
	private onTouchedCallback: () => void = noop;
	private onChangeCallback: (_: any) => void = noop;
	disabled: boolean;

	set value(v) {
		if (this.value !== v) {
			this._value = v;
			this.onChangeCallback(v);
		}
	}

	get value() {
		return this._value;
	}

	writeValue(value: any): void {
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

	setDisabledState?(isDisabled: boolean): void {
		this.disabled = isDisabled;
	}

}
