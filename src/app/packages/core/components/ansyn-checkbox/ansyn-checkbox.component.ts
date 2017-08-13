import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
	selector: 'ansyn-checkbox',
	templateUrl: './ansyn-checkbox.component.html',
	styleUrls: ['./ansyn-checkbox.component.less']
})

export class AnsynCheckboxComponent implements OnInit {
	public _checked;

	@Output() inputClicked = new EventEmitter<any>();
	@Input("id")id;
	@Input()
	set checked(value){
		this._checked = value;
	}
	get checked (){
		return this._checked;
	}

	@Input () text;

	constructor() {
	}

	ngOnInit() {
	}

	onInputClicked(event) {
		this.inputClicked.emit({event:event, data : {id: this.id,isChecked:!this._checked}});
	}
}
