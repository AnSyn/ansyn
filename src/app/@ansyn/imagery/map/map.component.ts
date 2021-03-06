import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseImageryPlugin } from '../model/base-imagery-plugin';
import { filter, map, take, tap } from 'rxjs/operators';
import { BaseImageryMap } from '../model/base-imagery-map';
import { IImageryMapPosition } from '../model/case-map-position.model';

@Component({
	selector: 'ansyn-map',
	templateUrl: './map.component.html',
	styleUrls: ['./map.component.less']
})
export class MapComponent implements OnInit, OnDestroy {
	@ViewChild('mapElement', {static: true}) protected mapElement: ElementRef;
	@ViewChild('mapElementShadowNorth', {static: true}) protected mapElementShadowNorth: ElementRef;
	@ViewChild('mapElementShadowDoubleBuffer', {static: true}) protected mapElementShadowDoubleBuffer: ElementRef;
	@ViewChild('mapViewContainerRef', { read: ViewContainerRef, static: true }) mapViewContainerRef: ViewContainerRef;

	constructor(public map: BaseImageryMap, @Inject(BaseImageryPlugin) public plugins: BaseImageryPlugin[]) {
	}

	createMap(layer: any, position?: IImageryMapPosition): Observable<BaseImageryMap> {
		return this.map
			.initMap(this.mapElement.nativeElement, this.mapElementShadowNorth.nativeElement, this.mapElementShadowDoubleBuffer.nativeElement, layer, position, this.mapViewContainerRef)
			.pipe(
				filter(Boolean),
				map(() => {
					this.map.initMapSubscriptions();
					return this.map
				}),
				take(1)
			);
	};

	ngOnDestroy(): void {
		if (this.map) {
			this.map.dispose();
		}
	}

	ngOnInit() {
	}

}
