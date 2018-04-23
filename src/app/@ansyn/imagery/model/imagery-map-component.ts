import { ElementRef, OnDestroy } from '@angular/core';
import { IMap } from './imap';
import { CaseMapPosition } from '@ansyn/core/models/case-map-position.model';
import { BaseImageryPlugin } from '@ansyn/imagery';
import { Observable } from 'rxjs/Observable';

export class ImageryMapComponent implements OnDestroy{
	protected map: IMap;
	protected mapElement: ElementRef;
	public plugins: BaseImageryPlugin[];

	createMap(layers: any, position?: CaseMapPosition): Observable<IMap> {
		return this.map
			.initMap(this.mapElement.nativeElement, layers, position)
			.filter(success => success)
			.map(() => this.map)
			.take(1)
	};

	ngOnDestroy(): void {
		if (this.map) {
			this.map.dispose();
		}
	}
}
