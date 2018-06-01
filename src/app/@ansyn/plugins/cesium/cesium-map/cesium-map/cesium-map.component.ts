import { Component, ElementRef, EventEmitter, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CesiumMap } from './cesium-map';
import {
	BaseImageryPluginProvider, ProvideMap,
} from '@ansyn/imagery/imagery/providers/imagery.providers';
import { ImageryMapComponent } from '@ansyn/imagery/model/imagery-map-component';
import { IMap } from '@ansyn/imagery/model/imap';
import { BaseImageryPlugin } from '@ansyn/imagery/model/base-imagery-plugin';

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
	@ViewChild('cesiumMap') protected mapElement: ElementRef;

	constructor(protected map: IMap,
				@Inject(BaseImageryPlugin) public plugins: BaseImageryPlugin[]) {
		super();
	}
}
