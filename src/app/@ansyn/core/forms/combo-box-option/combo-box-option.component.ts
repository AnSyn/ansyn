import { Component, ContentChild, HostListener, Input, ViewChild } from '@angular/core';
import { ComboBoxComponent } from '../combo-box/combo-box.component';

@Component({
	selector: 'ansyn-combo-box-option',
	templateUrl: './combo-box-option.component.html',
	styleUrls: ['./combo-box-option.component.less']
})
export class ComboBoxOptionComponent {
	@Input() value;
	@ContentChild('cont') cont;

	@HostListener('click') onClick() {
		console.log(this.cont);
		this._parent.selectOption(this.value);
	}

	get selected() {
		return this._parent.selected;
	}

	constructor(protected _parent: ComboBoxComponent) {
	}
}
