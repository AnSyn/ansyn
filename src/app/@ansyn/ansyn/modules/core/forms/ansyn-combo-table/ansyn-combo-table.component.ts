import { Component, ElementRef, EventEmitter, forwardRef, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { noop } from 'rxjs';

@Component({
	selector: 'ansyn-combo-table',
	templateUrl: './ansyn-combo-table.component.html',
	styleUrls: ['./ansyn-combo-table.component.less'],
	providers: [
	{
		provide: NG_VALUE_ACCESSOR,
		useExisting: forwardRef(() => AnsynComboTableComponent),
		multi: true
	}
	]
	})
	export class AnsynComboTableComponent implements ControlValueAccessor {

	onTouchedCallback: () => void = noop;
	onChangeCallback: (_: any) => void = noop;
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

	registerOnChange(fn: any): void {
	this.onChangeCallback = fn;
	}

	registerOnTouched(fn: any): void {
	this.onTouchedCallback = fn;
	}

	writeValue(value: any): void {
	if (!this.selected.includes(value)) {
		this.selected.push(value);
	}
	}
}
