import { ElementRef, InjectionToken, OnDestroy } from '@angular/core';
import { IMap } from './imap';
import { CaseMapPosition } from '@ansyn/core/models/case-map-position.model';
import { Observable } from 'rxjs';
import { BaseImageryPlugin } from '@ansyn/imagery/model/base-imagery-plugin';
import { filter, map, take } from 'rxjs/operators';
import { IMapClass } from '@ansyn/imagery/model/imap';

export class ImageryMapComponent implements OnDestroy{
	protected map: IMap;
	protected mapElement: ElementRef;
	public plugins: BaseImageryPlugin[];

	createMap(layers: any, position?: CaseMapPosition): Observable<IMap> {
		return this.map
			.initMap(this.mapElement.nativeElement, layers, position)
			.pipe(
				filter(success => success),
				map(() => this.map),
				take(1)
			)
	};

	ngOnDestroy(): void {
		if (this.map) {
			this.map.dispose();
		}
	}
}

export const IMAGERY_MAP_COMPONENTS_COLLECTION = new InjectionToken<ImageryMapComponent[][]>('IMAGERY_MAP_COMPONENTS_COLLECTION');
export const IMAGERY_MAP_COMPONENTS = new InjectionToken<ImageryMapComponent[]>('IMAGERY_MAP_COMPONENTS');

export interface ImageryMapComponentClass {
	mapClass: IMapClass;
	new(...args): ImageryMapComponent;
}

export function ImageryMapComponentFactory(imageryMapComponentsCollection: ImageryMapComponent[][]) {
	return imageryMapComponentsCollection.reduce((a, b) => [...a, ...b], [])
}
