import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { OpenLayersMap } from './open-layers-map';
import { IMap, IMapComponent } from '@ansyn/imagery';
import { MapPosition } from '../../imagery/model/map-position';


@Component({
	selector: 'ansyn-ol-component',
	template: `
		<div #olMap></div>`,
	styles: [
		`div {
			position: absolute;
			width: 100%;
			height: 100%;
			left: 0;
			top: 0;
			display: block;
			box-sizing: border-box;

		}`]
})

export class MapComponent implements OnInit, OnDestroy, IMapComponent {

	static mapName = 'openLayersMap';

	@ViewChild('olMap') mapElement: ElementRef;

	private _map: OpenLayersMap;
	public mapCreated: EventEmitter<IMap>;

	constructor() {
		this.mapCreated = new EventEmitter<IMap>();
	}

	ngOnInit(): void {
	}

	createMap(layers: any, position?: MapPosition): void {
		this._map = new OpenLayersMap(this.mapElement.nativeElement, layers, position);
		this.mapCreated.emit(this._map);
	}

	ngOnDestroy(): void {
		this._map.dispose();
	}

}
