import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IMapState, MapsProgress, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';

@Component({
	selector: 'ansyn-imagery-tile-progress',
	templateUrl: './imagery-tile-progress.component.html',
	styleUrls: ['./imagery-tile-progress.component.less']
})
export class ImageryTileProgressComponent implements OnInit, OnDestroy {
	@Input() mapId;
	@Input() lowered;

	private _subscriptions: Subscription[] = [];
	progress$ = this.store$.select(mapStateSelector)
		.pluck<IMapState, MapsProgress>('mapsProgress')
		.distinctUntilChanged()
		.map((mapsProgress: MapsProgress): number => mapsProgress[this.mapId]);

	progress;

	constructor(public store$: Store<IMapState>) {
	}

	ngOnInit() {
		this._subscriptions.push(
			this.progress$.subscribe((progress) => this.progress = progress)
		);
	}

	ngOnDestroy(): void {
		this._subscriptions.forEach(observable$ => observable$.unsubscribe());
	}
}
