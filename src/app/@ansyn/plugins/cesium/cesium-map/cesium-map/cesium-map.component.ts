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

export class CesiumMapComponent extends ImageryMapComponent {
	static mapClass = CesiumMap;
	@ViewChild('olMap') protected mapElement: ElementRef;

	constructor(protected map: IMap,
				@Inject(BaseImageryPlugin) public plugins: BaseImageryPlugin[]) {
		super();
	}
}
