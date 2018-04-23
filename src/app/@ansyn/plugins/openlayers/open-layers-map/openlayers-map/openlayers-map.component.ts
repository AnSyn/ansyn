import { Component, ElementRef, EventEmitter, Inject, OnDestroy, ViewChild } from '@angular/core';
import { OpenLayersMap } from './openlayers-map';
import { BaseImageryPlugin, IMap, ImageryMapComponent } from '@ansyn/imagery';
import { CaseMapPosition } from '@ansyn/core/models/case-map-position.model';
import {
	BaseImageryPluginProvider,
	ProvideMap,
} from '@ansyn/imagery/imagery/providers/imagery.providers';

@Component({
	selector: 'ansyn-ol-component',
	templateUrl: './openlayers-map.component.html',
	styleUrls: ['./openlayers-map.component.less'],
	providers: [
		ProvideMap(OpenLayersMap),
		BaseImageryPluginProvider
	]
})

export class OpenlayersMapComponent extends ImageryMapComponent {
	static mapClass = OpenLayersMap;
	@ViewChild('olMap') protected mapElement: ElementRef;

	constructor(protected map: IMap,
				@Inject(BaseImageryPlugin) public plugins: BaseImageryPlugin[]) {
		super();
	}
}
