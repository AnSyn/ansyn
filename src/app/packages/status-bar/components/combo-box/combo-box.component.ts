import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
	selector: 'ansyn-combo-box',
	templateUrl: './combo-box.component.html',
	styleUrls: ['./combo-box.component.less']
})
export class ComboBoxComponent{
	private _selectedIndex: number;
	@ViewChild('optionsContainer') optionsContainer: ElementRef;
	@ViewChild('optionsTrigger') optionsTrigger: ElementRef;

	@Input() options: any[];
	@Input('selectedIndex') set selectedIndex(value){
		this._selectedIndex = value;
		this.selectedIndexChange.emit(value);
	};
	@Output('selectedIndexChange') selectedIndexChange = new EventEmitter();

	get selectedIndex() {
		return this._selectedIndex;
	}

	toggleShow() {
		if(this.optionsContainer.nativeElement.style.visibility !== 'visible' ) {
			this.optionsContainer.nativeElement.style.visibility = 'visible';
			this.optionsContainer.nativeElement.focus();
		} else {
			this.optionsContainer.nativeElement.style.visibility = 'hidden';
		}
	}

	onBlurOptionsContainer($event: FocusEvent){
		if($event.relatedTarget !== this.optionsTrigger.nativeElement){
			this.optionsContainer.nativeElement.style.visibility = 'hidden';
		}
	}
	selectOption(index) {
		this.selectedIndex = index;
		this.optionsContainer.nativeElement.style.visibility = 'hidden';
	}

	get selected() {
		return this.options[this.selectedIndex];
	}

}
