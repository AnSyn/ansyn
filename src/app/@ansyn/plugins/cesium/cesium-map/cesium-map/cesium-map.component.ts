import { Component, ElementRef, EventEmitter, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IMap, IMapComponent } from '@ansyn/imagery/index';
import { CesiumMap } from './cesium-map';
import { BaseImageryPlugin } from '@ansyn/imagery';
import { getPluginsProvider } from '@ansyn/imagery/imagery/providers/collections.factory';
import { OpenlayersMapComponent } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map.component';


@Component({
	selector: 'ansyn-cesium-component',
	templateUrl: './cesium-map.component.html',
	styleUrls: ['./cesium-map.component.less'],
	providers: [getPluginsProvider(OpenlayersMapComponent.mapName)]
})

export class CesiumMapComponent implements OnInit, OnDestroy, IMapComponent {

	static mapName = 'cesiumMap';
	static mapClass = CesiumMap;

	@ViewChild('cesiumMap') mapElement: ElementRef;

	private _map: CesiumMap;
	public mapCreated: EventEmitter<IMap>;

	constructor(@Inject(BaseImageryPlugin) public plugins: BaseImageryPlugin[]) {
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
