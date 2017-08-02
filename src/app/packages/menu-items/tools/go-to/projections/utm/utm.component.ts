import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
	selector: 'ansyn-utm',
	templateUrl: './utm.component.html',
	styleUrls: ['./utm.component.less']
})
export class UtmComponent {
	private _coordinates: number[];
	@Output() coordinatesChange = new EventEmitter();

	@Input('coordinates') set coordinates(value) {
		this._coordinates = value.map((num) => Math.floor(num));
	}

	get coordinates() {
		return this._coordinates;
	}

	onChanges() {
		this.coordinatesChange.emit(this.coordinates);
	}


}
