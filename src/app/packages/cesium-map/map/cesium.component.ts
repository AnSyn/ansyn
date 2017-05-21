/**
 * Created by AsafMas on 11/05/2017.
 */
import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IMap, IMapComponent } from '@ansyn/imagery';
import { CesiumMap } from './cesium-map';
/**
 * Created by AsafMas on 07/05/2017.
 */
@Component({
	selector: 'ansyn-cesium-component',
	template: `
		<div #cesiumMap>Working!</div>
	`,
	styles: [
			`div{
			width: 100%;
			height: 100%;
		}`]
})

export class CesiumComponent implements OnInit, OnDestroy, IMapComponent {

	@ViewChild('cesiumMap') mapElement: ElementRef;

	private _map: CesiumMap;
	public mapCreated: EventEmitter<IMap>;

	constructor() {

	}

	createMap(layers: any) {
		this.mapCreated = new EventEmitter<IMap>();
	}

	ngOnInit(): void {
		console.log(`'cesiumComponent init'`);
		this._map = new CesiumMap(this.mapElement.nativeElement);
		this.mapCreated.emit(this._map);
	}

	ngOnDestroy(): void {
		// this._map.dispose();
		console.log(`'cesiumComponent destroy'`);
	}

}
