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

export class OpenlayersMapComponent implements OnDestroy, ImageryMapComponent {
	static mapClass = OpenLayersMap;
	@ViewChild('olMap') mapElement: ElementRef;
	public mapCreated: EventEmitter<IMap> = new EventEmitter<IMap>();

	constructor(private _map: IMap,
				@Inject(BaseImageryPlugin) public plugins: BaseImageryPlugin[]) {
	}

	createMap(layers: any, position?: CaseMapPosition): void {
		this._map.initMap(this.mapElement.nativeElement, layers, position).subscribe(() => {
			this.mapCreated.emit(this._map);
		});

	}

	ngOnDestroy(): void {
		if (this._map) {
			this._map.dispose();
		}
	}

}
