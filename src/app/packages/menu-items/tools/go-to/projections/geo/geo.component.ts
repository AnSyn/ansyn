import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
	selector: 'ansyn-geo',
	templateUrl: './geo.component.html',
	styleUrls: ['./geo.component.less']
})
export class GeoComponent {
	@Output() changes = new EventEmitter();
	@Input('coordinates') coordinates: any[];

	onChanges() {
		this.changes.emit(this.coordinates);
	}


}
