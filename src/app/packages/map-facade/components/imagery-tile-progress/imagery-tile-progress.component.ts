import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IMapState, MapsProgress, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { Store } from '@ngrx/store';
import { SetProgressBarAction } from '@ansyn/map-facade';

@Component({
	selector: 'ansyn-imagery-tile-progress',
	templateUrl: './imagery-tile-progress.component.html',
	styleUrls: ['./imagery-tile-progress.component.less']
})
export class ImageryTileProgressComponent implements OnInit, OnDestroy {
	@Input() mapId;
	@Input() lowered;

	mapsProgress$ = this.store$.select(mapStateSelector)
		.pluck<IMapState, MapsProgress>('mapsProgress')
		.distinctUntilChanged();

	mapsProgress;
	progress;

	constructor(public store$: Store<IMapState>) {
	}

	ngOnInit() {
		this.mapsProgress$.subscribe((mapsProgress: MapsProgress) => {
			this.mapsProgress = mapsProgress;
			this.progress = mapsProgress[this.mapId]
		});
	}

	ngOnDestroy() {
		const updatedMapProgress = { ...this.mapsProgress };
		delete updatedMapProgress[this.mapId];
		this.store$.dispatch(new SetProgressBarAction(updatedMapProgress));
	}
}
