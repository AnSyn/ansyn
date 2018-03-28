import { Component, ElementRef, EventEmitter, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { OpenLayersMap, openLayersMapName } from './openlayers-map';
import { BaseImageryPlugin, IMap, IMapComponent } from '@ansyn/imagery';
import { CaseMapPosition } from '@ansyn/core/models/case-map-position.model';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { getBaseImageryPluginFactory } from '@ansyn/imagery/imagery/providers/collections.factory';
export const BaseImageryPluginFactory = getBaseImageryPluginFactory(openLayersMapName);

@Component({
	selector: 'ansyn-ol-component',
	templateUrl: './openlayers-map.component.html',
	styleUrls: ['./openlayers-map.component.less'],
	providers: [BaseImageryPluginFactory]
})

export class OpenlayersMapComponent implements OnInit, OnDestroy, IMapComponent {

	static mapName = openLayersMapName;
	static mapClass = OpenLayersMap;

	@ViewChild('olMap') mapElement: ElementRef;

	private _map: OpenLayersMap;
	public mapCreated: EventEmitter<IMap> = new EventEmitter<IMap>();

	constructor(private projectionService: ProjectionService, @Inject(BaseImageryPlugin) public plugins: BaseImageryPlugin[]) {

	}

	ngOnInit(): void {
	}

	createMap(layers: any, position?: CaseMapPosition): void {
		this._map = new OpenLayersMap(this.mapElement.nativeElement, this.projectionService, layers, position);
		this.mapCreated.emit(this._map);
	}

	ngOnDestroy(): void {
		this._map.dispose();
	}

}
