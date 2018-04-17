import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Actions } from '@ngrx/effects';
import { MapActionTypes, SetProgressBarAction } from '../../actions/map.actions';

@Component({
	selector: 'ansyn-imagery-tile-progress',
	templateUrl: './imagery-tile-progress.component.html',
	styleUrls: ['./imagery-tile-progress.component.less']
})
export class ImageryTileProgressComponent implements OnInit, OnDestroy {
	@Input() mapId;
	@Input() lowered;

	private _subscriptions: Subscription[] = [];
	progress$ = this.actions$
		.ofType(MapActionTypes.VIEW.SET_PROGRESS_BAR)
		.filter((action: SetProgressBarAction) => action.payload.mapId === this.mapId )
		.map((action: SetProgressBarAction) => action.payload.progress)
		.do((progress) => this.progress = progress);

	progress;

	constructor(public actions$: Actions) {
	}

	ngOnInit() {
		this._subscriptions.push(
			this.progress$.subscribe()
		);
	}

	ngOnDestroy(): void {
		this._subscriptions.forEach(observable$ => observable$.unsubscribe());
	}
}
