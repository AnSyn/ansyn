import { Component, ElementRef, EventEmitter, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IMap, ImageryMapComponent } from '@ansyn/imagery/index';
import { CesiumMap } from './cesium-map';
import { BaseImageryPlugin } from '@ansyn/imagery';
import {
	BaseImageryPluginProvider, ProvideMap,
} from '@ansyn/imagery/imagery/providers/imagery.providers';

@Component({
	selector: 'ansyn-cesium-component',
	templateUrl: './cesium-map.component.html',
	styleUrls: ['./cesium-map.component.less'],
	providers: [
		ProvideMap(CesiumMap),
		BaseImageryPluginProvider
	]
})

export class CesiumMapComponent implements OnInit, OnDestroy, ImageryMapComponent {
	static mapClass = CesiumMap;

	@ViewChild('cesiumMap') mapElement: ElementRef;

	public mapCreated: EventEmitter<IMap> = new EventEmitter<IMap>();;

	constructor(private _map: IMap,
		@Inject(BaseImageryPlugin) public plugins: BaseImageryPlugin[]) {
	}

	createMap(layers: any) {
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
