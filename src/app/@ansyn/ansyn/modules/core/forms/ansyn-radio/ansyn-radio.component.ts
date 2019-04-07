import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { noop } from 'rxjs/index';
import { UUID } from 'angular2-uuid';

@Component({
	selector: 'ansyn-radio',
	templateUrl: './ansyn-radio.component.html',
	styleUrls: ['./ansyn-radio.component.less'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => AnsynRadioComponent),
			multi: true
		}
	]
})
export class AnsynRadioComponent implements OnInit, ControlValueAccessor {
	@Input() value;
	id = UUID.UUID();
	private _model: any = '';
	private onTouchedCallback: () => void = noop;
	private onChangeCallback: (_: any) => void = noop;
	disabled: boolean;

	constructor() {
	}

	get model(): any {
		return this._model;
	};

	set model(v: any) {
		if (v !== this._model) {
			this._model = v;
			this.onChangeCallback(v);
		}
	}

	ngOnInit() {
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

	writeValue(value: any) {
		if (value !== this._model) {
			this._model = value;
		}
	}

}
