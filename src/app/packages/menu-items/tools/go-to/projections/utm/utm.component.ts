import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
	selector: 'ansyn-utm',
	templateUrl: './utm.component.html',
	styleUrls: ['./utm.component.less']
})
export class UtmComponent {
	@Output() changes = new EventEmitter();
	@Input('coordinates') coordinates: any[];

	onChanges() {
		this.changes.emit(this.coordinates);
	}

}
