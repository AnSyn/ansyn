import { Component, ElementRef, EventEmitter, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IMap, IMapComponent } from '@ansyn/imagery/index';
import { CesiumMap } from './cesium-map';
import { BaseImageryPlugin } from '@ansyn/imagery';
import {
	BaseImageryPluginProvider, ProvideMap,
	ProvideMapName
} from '@ansyn/imagery/imagery/providers/imagery.providers';
export const CesiumMapName = 'cesiumMap';

@Component({
	selector: 'ansyn-cesium-component',
	templateUrl: './cesium-map.component.html',
	styleUrls: ['./cesium-map.component.less'],
	providers: [
		ProvideMap(CesiumMap),
		ProvideMapName(CesiumMapName),
		BaseImageryPluginProvider
	]
})

export class CesiumMapComponent implements OnInit, OnDestroy, IMapComponent {
	static mapClass = CesiumMap;

	@ViewChild('cesiumMap') mapElement: ElementRef;

	public mapCreated: EventEmitter<IMap>;

	constructor(private _map: IMap,
		@Inject(BaseImageryPlugin) public plugins: BaseImageryPlugin[]) {
		this.mapCreated = new EventEmitter<IMap>();
	}

	createMap(layers: any) {
		this._map = new CesiumMap(this.mapElement.nativeElement);
		this._map.initMap(this.mapElement.nativeElement)
			.filter(success => success)
			.do(() => this.mapCreated.emit(this._map))
			.subscribe();
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
		// this._map.dispose();
	}

}
