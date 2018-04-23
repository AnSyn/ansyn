import { Component, ElementRef, EventEmitter, Inject, OnDestroy, ViewChild } from '@angular/core';
import { OpenLayersDisabledMap } from './openlayers-disabled-map';
import { BaseImageryPlugin, ImageryMapComponent, IMap } from '@ansyn/imagery';
import { CaseMapPosition } from '@ansyn/core/models/case-map-position.model';
import { BaseImageryPluginProvider, ProvideMap } from '@ansyn/imagery/imagery/providers/imagery.providers';

@Component({
	selector: 'ansyn-disabled-ol-component',
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

		}`],
	providers: [
		ProvideMap(OpenLayersDisabledMap),
		BaseImageryPluginProvider
	]
})

export class OpenLayersDisabledMapComponent extends ImageryMapComponent {
	static mapClass = OpenLayersDisabledMap;
	@ViewChild('olMap') protected mapElement: ElementRef;

	constructor(protected map: IMap,
				@Inject(BaseImageryPlugin) public plugins: BaseImageryPlugin[]) {
		super();
	}

}
