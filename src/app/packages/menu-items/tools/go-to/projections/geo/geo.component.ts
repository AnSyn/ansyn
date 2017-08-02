import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
	selector: 'ansyn-geo',
	templateUrl: './geo.component.html',
	styleUrls: ['./geo.component.less']
})
export class GeoComponent {
	private _coordinates: number[];
	@Output() coordinatesChange = new EventEmitter();

	@Input('coordinates') set coordinates(value) {
		this._coordinates = value.map((num) => +num.toFixed(5));
	}

	get coordinates() {
		return this._coordinates;
	}

	onChanges() {
		this.coordinatesChange.emit(this.coordinates);
	}


}
