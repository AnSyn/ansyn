import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';

@Component({
	selector: 'ansyn-go-to',
	templateUrl: './go-to.component.html',
	styleUrls: ['./go-to.component.less']
})
export class GoToComponent {
	_expand;
	@Output() expandChange= new EventEmitter();
	@HostBinding('class.expand') @Input() set expand(value) {
		this._expand = value;
		this.expandChange.emit(value);
	};
	get expand() {
		return this._expand
	}

	constructor() { }

	submitGoTo() {
	}
}
