import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ICaseMapPosition } from '@ansyn/core';
import { Observable } from 'rxjs';
import { BaseImageryPlugin } from '../model/base-imagery-plugin';
import { filter, map, take } from 'rxjs/operators';
import { BaseImageryMap } from '../model/base-imagery-map';

@Component({
	selector: 'ansyn-map',
	templateUrl: './map.component.html',
	styleUrls: ['./map.component.less']
})
export class MapComponent implements OnInit, OnDestroy {
	@ViewChild('mapElement') protected mapElement: ElementRef;

	constructor(protected map: BaseImageryMap, @Inject(BaseImageryPlugin) public plugins: BaseImageryPlugin[]) {
	}

	createMap(layers: any, position?: ICaseMapPosition): Observable<BaseImageryMap> {
		return this.map
			.initMap(this.mapElement.nativeElement, layers, position)
			.pipe(
				filter(success => success),
				map(() => this.map),
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
