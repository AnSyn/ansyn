import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';

@Component({
	selector: 'ansyn-checkbox',
	templateUrl: './ansyn-checkbox.component.html',
	styleUrls: ['./ansyn-checkbox.component.less']
})

export class AnsynCheckboxComponent implements OnInit {
	public _checked;
	public _disabled;

	@Output() inputClicked = new EventEmitter<any>();
	@Input('id') id;


	@Input()
	set checked(value) {
		this._checked = value;
	}

	get checked() {
		return this._checked;
	}

	@HostBinding('class.disabled')
	@Input()
	set disabled(value) {
		this._disabled = value;
	}

	get disabled() {
		return this._disabled;
	}

	@Input() text;

	constructor() {
	}

	ngOnInit() {
	}

	onInputClicked(event) {
		if (this._disabled) {
			return false;
		}
		this.inputClicked.emit({ event: event, data: { id: this.id, isChecked: !this._checked } });
	}
}
