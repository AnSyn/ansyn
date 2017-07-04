import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
	selector: 'ansyn-combo-box',
	templateUrl: './combo-box.component.html',
	styleUrls: ['./combo-box.component.less']
})
export class ComboBoxComponent implements OnInit {
	private _selectedIndex: number;
	show = false;
	@Input() options: any[];

	@Input('selectedIndex')
	set selectedIndex(value){
		this._selectedIndex = value;
		this.selectedChange.emit(value);
	};

	get selectedIndex() {
		return this._selectedIndex;
	}
	toggleShow($event) {
		$event.stopPropagation();
		this.show = !this.show;
	}
	get selected() {
		return this.options[this.selectedIndex];
	}

	@Output('selectedIndexChange') selectedChange = new EventEmitter();

	constructor() { }

	ngOnInit() {
		this.selectedIndex = 0;
	}

}
