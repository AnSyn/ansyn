import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { OpenLayersDisabledMap } from './open-layers-disabled-map';
import { IMap, IMapComponent, MapPosition } from '@ansyn/imagery';


@Component({
	selector: 'ansyn-ol-component',
	template: `
		<div #olMap></div>
	`,
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

export class DisabledMapComponent implements OnInit, OnDestroy, IMapComponent {

	static mapName = 'disabledOpenLayersMap';

	@ViewChild('olMap') mapElement: ElementRef;

	private _map: OpenLayersDisabledMap;
	public mapCreated: EventEmitter<IMap<any>>;

	constructor() {
		this.mapCreated = new EventEmitter<IMap<any>>();
	}

	ngOnInit(): void {
	}

	createMap(layers: any, position?: MapPosition): void {
		this._map = new OpenLayersDisabledMap(this.mapElement.nativeElement, layers, position);
		this.mapCreated.emit(this._map);
	}

	ngOnDestroy(): void {
		this._map.dispose();
	}
}
