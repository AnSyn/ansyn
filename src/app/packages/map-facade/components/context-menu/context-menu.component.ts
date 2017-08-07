import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';

@Component({
	selector: 'ansyn-context-menu',
	templateUrl: './context-menu.component.html',
	styleUrls: ['./context-menu.component.less']
})
export class ContextMenuComponent {
	private _show;

	@HostBinding('class.visible') @Input() set show(value) {
		this.showChange.emit(value);
		this._show = value;
	}

	get show() {
		return this._show;
	}

	get contextMenuStyle() {
		return {
			top: `${this.top}px`,
			left: `${this.left}px`
		}
	}

	@Input() top = 0;
	@Input() left = 0;
	@Output() showChange = new EventEmitter();



}
