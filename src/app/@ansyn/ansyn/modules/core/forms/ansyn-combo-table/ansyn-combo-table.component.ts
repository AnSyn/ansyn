import { Component, ElementRef, EventEmitter, Injector, Input, Output, ViewChild } from '@angular/core';

@Component({
	selector: 'ansyn-combo-table',
	templateUrl: './ansyn-combo-table.component.html',
	styleUrls: ['./ansyn-combo-table.component.less']})
	export class AnsynComboTableComponent {

	@ViewChild('optionsContainer') optionsContainer: ElementRef;
	@Input() icon: string;
	disabled: boolean;
	@Input() selected: any[];
	@Input() buttonClass: string;
	@Input() isLine: boolean;
	@Input() contentTitle: string;
	@Input() isFullSize: boolean;

	@Input() required: boolean;

	@Output() selectedItemsArray = new EventEmitter<any[]>();

	constructor(public injector: Injector) { }

	selectOption(selected) {
		if (this.selected.includes(selected)) {
			this.selected = this.selected.filter(selectedButton => selectedButton !== selected);
		} else {
			this.selected = [...this.selected, selected];
		}
		this.selectedItemsArray.emit(this.selected);
	}

	selectAllOptions(allOptionsArray: any[]) {
		this.selected = allOptionsArray.slice();
		this.selectedItemsArray.emit(this.selected);
	}

	resetSelection() {
		this.selected = [];
		this.selectedItemsArray.emit(this.selected);
	}

}
