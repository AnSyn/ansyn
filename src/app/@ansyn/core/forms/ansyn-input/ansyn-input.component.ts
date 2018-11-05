import { Component, ElementRef, forwardRef, HostBinding, Input, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UUID } from 'angular2-uuid';

const noop = () => {
};

@Component({
	selector: 'ansyn-input',
	templateUrl: './ansyn-input.component.html',
	styleUrls: ['./ansyn-input.component.less'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => AnsynInputComponent),
			multi: true
		}
	]
})
export class AnsynInputComponent implements ControlValueAccessor {
	@Input() label: string;
	@Input() required = true;
	@Input() name;
	@Input() autocomplete: 'off' | 'on' = 'off';
	@Input() id = UUID.UUID();

	@Input()
	@HostBinding('class.white') white: boolean;

	private innerValue: any = '';
	private onTouchedCallback: () => void = noop;
	private onChangeCallback: (_: any) => void = noop;

	get value(): any {
		return this.innerValue;
	};

	set value(v: any) {
		if (v !== this.innerValue) {
			this.innerValue = v;
			this.onChangeCallback(v);
		}
	}

	@ViewChild('input') input: ElementRef;

	onBlur() {
		this.onTouchedCallback();
	}

	writeValue(value: any) {
		if (value !== this.innerValue) {
			this.innerValue = value;
		}
	}

	registerOnChange(fn: any) {
		this.onChangeCallback = fn;
	}

	registerOnTouched(fn: any) {
		this.onTouchedCallback = fn;
	}

	select() {
		if (this.input) {
			this.input.nativeElement.select();
		}
	}
}
