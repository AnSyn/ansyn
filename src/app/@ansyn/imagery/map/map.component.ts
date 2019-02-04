import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ICaseMapPosition } from '@ansyn/core';
import { forkJoin, Observable, of } from 'rxjs';
import { BaseImageryPlugin } from '../model/base-imagery-plugin';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { BaseImageryMap } from '../model/base-imagery-map';

@Component({
	selector: 'ansyn-map',
	templateUrl: './map.component.html',
	styleUrls: ['./map.component.less']
})
export class MapComponent implements OnInit, OnDestroy {
	@ViewChild('mapElement') protected mapElement: ElementRef;
	@ViewChild('mapElementShadow') protected mapElementShadow: ElementRef;

	constructor(public map: BaseImageryMap, @Inject(BaseImageryPlugin) public plugins: BaseImageryPlugin[]) {
	}

	createMap(layers: any, position?: ICaseMapPosition): Observable<BaseImageryMap> {
		return this.map
			.initMap(this.mapElement.nativeElement, this.mapElementShadow.nativeElement, layers, position)
			.pipe(
				filter(success => success),
				map(() => this.map),
				tap(() => {
					this.map.initMapSubscriptions();
					this.map.isLoadingLayers$.pipe(
						filter((isLoadingLayers) => !isLoadingLayers),
						tap(() => console.log('createMap', 'done Loading Layers, resetting plugins')),
						switchMap(() => this.resetPlugins()),
						take(1)
					).subscribe();
				}),
				take(1),
			);
	};

	resetPlugins(): Observable<boolean> {
		console.log('resetPlugins');
		if (!this.plugins || this.plugins.length === 0) {
			return of(true);
		}

		const resetObservables = this.plugins.map((plugin) => plugin.onResetView());
		return forkJoin(resetObservables).pipe(map(results => results.every(b => b === true)));
	}

	ngOnDestroy(): void {
		if (this.map) {
			this.map.dispose();
		}
	}

	ngOnInit() {
	}

}
