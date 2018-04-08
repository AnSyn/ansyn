import { ElementRef, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { IMap } from './imap';
import { CaseMapPosition } from '@ansyn/core/models/case-map-position.model';
import { BaseImageryPlugin } from '@ansyn/imagery';

export class ImageryMapComponent implements OnDestroy{
	protected map: IMap;
	protected mapElement: ElementRef;
	public mapCreated: EventEmitter<IMap> = new EventEmitter<IMap>();
	public plugins: BaseImageryPlugin[];

	createMap(layers: any, position?: CaseMapPosition): void {
		this.map
			.initMap(this.mapElement.nativeElement, layers, position)
			.filter(success => success)
			.do(() => this.mapCreated.emit(this.map))
			.take(1)
			.subscribe();
	};

	ngOnDestroy(): void {
		if (this.map) {
			this.map.dispose();
		}
	}
}
