import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { IEntryComponent, selectMaps, selectMapsTotal } from "@ansyn/map-facade";
import { Store, select } from '@ngrx/store';
import { tap } from 'rxjs/operators';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { BackToWorldView } from '../../actions/overlay-status.actions';

@Component({
	selector: 'ansyn-back-to-base-map',
	templateUrl: './back-to-base-map.component.html',
	styleUrls: ['./back-to-base-map.component.less']
})
@AutoSubscriptions()
export class BackToBaseMapComponent implements OnInit, OnDestroy, IEntryComponent {
	static TYPE = 'buttons';
	static showFirst = true;
	@Input() mapId: string;
	mapsAmount: number;
	overlay: any;

	@AutoSubscription
	mapsAmount$ = this.store$.pipe(
		select(selectMapsTotal),
		tap((mapsAmount) => this.mapsAmount = mapsAmount)
	);

	@AutoSubscription
	overlay$ = this.store$.pipe(
		select(selectMaps),
		tap((maps) => {
			if (maps[this.mapId]) {
				this.overlay = maps[this.mapId].data.overlay;
			}
		})
	);
	constructor(protected store$: Store<any>) {
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
	}

	backToWorldView() {
		this.store$.dispatch(new BackToWorldView({mapId: this.mapId}));
	}
}
