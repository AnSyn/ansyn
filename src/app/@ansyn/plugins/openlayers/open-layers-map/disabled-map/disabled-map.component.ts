import { Component, ElementRef, EventEmitter, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { OpenLayersDisabledMap } from './open-layers-disabled-map';
import { BaseImageryPlugin, IMap, IMapComponent } from '@ansyn/imagery';
import { CaseMapPosition } from '@ansyn/core/models/case-map-position.model';
import { getPluginsProvider } from '@ansyn/imagery/imagery/providers/collections.factory';


@Component({
	selector: 'ansyn-ol-component',
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
	providers: [getPluginsProvider(DisabledMapComponent.mapName)]
})

export class DisabledMapComponent implements OnInit, OnDestroy, IMapComponent {

	static mapName = 'disabledOpenLayersMap';
	static mapClass = OpenLayersDisabledMap;

	@ViewChild('olMap') mapElement: ElementRef;

	private _map: OpenLayersDisabledMap;
	public mapCreated: EventEmitter<IMap>;

	constructor(@Inject(BaseImageryPlugin) public plugins: BaseImageryPlugin[]) {
		this.mapCreated = new EventEmitter<IMap>();
	}

	ngOnInit(): void {
	}

	createMap(layers: any, position?: CaseMapPosition): void {
		this._map = new OpenLayersDisabledMap(this.mapElement.nativeElement, layers, position);
		this.mapCreated.emit(this._map);
	}

	ngOnDestroy(): void {
		this._map.dispose();
	}
}
