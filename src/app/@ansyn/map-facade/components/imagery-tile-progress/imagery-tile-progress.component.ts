import { Component, Input, OnInit } from '@angular/core';
import { IMapState, MapsProgress, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
@Component({
	selector: 'ansyn-imagery-tile-progress',
	templateUrl: './imagery-tile-progress.component.html',
	styleUrls: ['./imagery-tile-progress.component.less']
})
export class ImageryTileProgressComponent implements OnInit {
	@Input() mapId;
	@Input() lowered;

	progress$ = this.store$.select(mapStateSelector)
		.pluck<IMapState, MapsProgress>('mapsProgress')
		.distinctUntilChanged()
		.map((mapsProgress: MapsProgress): number => mapsProgress[this.mapId]);

	progress;

	constructor(public store$: Store<IMapState>) {
	}

	ngOnInit() {
		this.progress$.subscribe((progress) => this.progress = progress);
	}
}
