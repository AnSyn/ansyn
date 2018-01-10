import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { OpenLayersMap } from './openlayers-map';
import { IMap, IMapComponent } from '@ansyn/imagery';
import { ICaseMapPosition } from '@ansyn/core/models/case-map-position.model';


@Component({
	selector: 'ansyn-ol-component',
	templateUrl: './openlayers-map.component.html',
	styleUrls: ['./openlayers-map.component.less']
})

export class OpenlayersMapComponent implements OnInit, OnDestroy, IMapComponent {

	static mapName = 'openLayersMap';
	static mapClass = OpenLayersMap;

	@ViewChild('olMap') mapElement: ElementRef;

	private _map: OpenLayersMap;
	public mapCreated: EventEmitter<IMap> = new EventEmitter<IMap>();

	ngOnInit(): void {
	}

	createMap(layers: any, position?: ICaseMapPosition): void {
		this._map = new OpenLayersMap(this.mapElement.nativeElement, layers, position);
		this.mapCreated.emit(this._map);
	}

	ngOnDestroy(): void {
		this._map.dispose();
	}

}
