import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { OpenLayerMap } from './openLayerMap';
import { IMap, IMapComponent } from '@ansyn/imagery/model/model';
/**
 * Created by AsafMas on 07/05/2017.
 */
@Component({
	selector: 'ansyn-ol-component',
	template: `
		<div #olMap></div>
	`,
	styles: [
			`div{
			width: 100%;
			height: 100%;
		}`]
})

export class OpenLayerComponent implements OnInit, OnDestroy, IMapComponent {

	@ViewChild('olMap') mapElement: ElementRef;

	private _map: OpenLayerMap;
	public mapCreated: EventEmitter<IMap>;

	constructor() {
		this.mapCreated = new EventEmitter<IMap>();
	}

	ngOnInit(): void {
		console.log(`'OpenLayerComponent init'`);
		this._map = new OpenLayerMap(this.mapElement.nativeElement);
		this.mapCreated.emit(this._map);
	}

	ngOnDestroy(): void {
		this._map.dispose();
		console.log(`'OpenLayerComponent destroy'`);
	}

}
