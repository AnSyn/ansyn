import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ICaseMapPosition } from '@ansyn/core';
import { Observable } from 'rxjs';
import { BaseImageryPlugin } from '../model/base-imagery-plugin';
import { filter, map, take, tap } from 'rxjs/operators';
import { BaseImageryMap } from '../model/base-imagery-map';

@Component({
	selector: 'ansyn-map',
	templateUrl: './map.component.html',
	styleUrls: ['./map.component.less']
})
export class MapComponent implements OnInit, OnDestroy {
	@ViewChild('mapElement') protected mapElement: ElementRef;
	@ViewChild('mapElementShadowNorth') protected mapElementShadowNorth: ElementRef;
	@ViewChild('mapElementShadowDoubleBuffer') protected mapElementShadowDoubleBuffer: ElementRef;

	constructor(public map: BaseImageryMap, @Inject(BaseImageryPlugin) public plugins: BaseImageryPlugin[]) {
	}

	createMap(layers: any, position?: ICaseMapPosition, mapId?: string): Observable<BaseImageryMap> {
		return this.map
			.initMap(this.mapElement.nativeElement, this.mapElementShadowNorth.nativeElement, this.mapElementShadowDoubleBuffer.nativeElement, layers, position, mapId)
			.pipe(
				filter(success => success),
				map(() => this.map),
				tap(() => this.map.initMapSubscriptions()),
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
