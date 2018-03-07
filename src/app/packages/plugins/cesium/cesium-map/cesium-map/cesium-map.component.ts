import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IMap, IMapComponent } from 'app/packages/imagery/index';
import { CesiumMap } from './cesium-map';


@Component({
	selector: 'ansyn-cesium-component',
	templateUrl: './cesium-map.component.html',
	styleUrls: ['./cesium-map.component.less']
})

export class CesiumMapComponent implements OnInit, OnDestroy, IMapComponent {

	static mapName = 'cesiumMap';
	static mapClass = CesiumMap;

	@ViewChild('cesiumMap') mapElement: ElementRef;

	private _map: CesiumMap;
	public mapCreated: EventEmitter<IMap>;

	constructor() {
		this.mapCreated = new EventEmitter<IMap>();
	}

	createMap(layers: any) {
		this._map = new CesiumMap(this.mapElement.nativeElement);
		this.mapCreated.emit(this._map);
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
		// this._map.dispose();
	}

}
