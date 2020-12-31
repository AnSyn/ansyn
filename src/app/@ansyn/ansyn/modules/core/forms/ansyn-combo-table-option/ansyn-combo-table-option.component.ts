import { Component, ElementRef, HostBinding, HostListener, Input, OnInit } from '@angular/core';
import { AnsynComboTableComponent } from '../ansyn-combo-table/ansyn-combo-table.component';

@Component({
	selector: 'ansyn-combo-table-option',
	templateUrl: './ansyn-combo-table-option.component.html',
	styleUrls: ['./ansyn-combo-table-option.component.less']
	})
	export class AnsynComboTableOptionComponent implements OnInit {

	get selected() {
	return this._parent.selected;
	}
	@Input() value;

	@HostBinding('class.disabled')
	@Input() disabled = false;

	constructor(protected _parent: AnsynComboTableComponent, protected el: ElementRef) { }

	@HostListener('click') onClick() {
		if (this.value) {
			this._parent.selectOption(this.value);
		}
	}

	ngOnInit(): void {
	}
}
