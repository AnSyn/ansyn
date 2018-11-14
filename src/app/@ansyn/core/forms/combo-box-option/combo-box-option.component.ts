import { Component, HostBinding, HostListener, Input } from '@angular/core';
import { ComboBoxComponent } from '../combo-box/combo-box.component';

@Component({
	selector: 'ansyn-combo-box-option',
	templateUrl: './combo-box-option.component.html',
	styleUrls: ['./combo-box-option.component.less']
})
export class ComboBoxOptionComponent {
	@Input() value;

	@HostBinding('class.disabled')
	@Input() disabled: boolean;

	@HostListener('click') onClick() {
		if (this.value) {
			this._parent.selectOption(this.value);
		}
		this._parent.close();
	}

	get selected() {
		return this._parent.selected;
	}

	constructor(protected _parent: ComboBoxComponent) {
	}
}
