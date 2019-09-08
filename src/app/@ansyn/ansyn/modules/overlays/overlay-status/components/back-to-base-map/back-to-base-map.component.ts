import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IMapSettings } from '@ansyn/imagery';
import { IEntryComponent, selectMaps, selectMapsTotal } from '@ansyn/map-facade';
import { select, Store } from '@ngrx/store';
import { tap } from 'rxjs/operators';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { BackToWorldView } from '../../actions/overlay-status.actions';
import { Observable } from 'rxjs';
import { Dictionary } from '@ngrx/entity';
import { selectIsPinned } from '@ansyn/menu';

@Component({
	selector: 'ansyn-back-to-base-map',
	templateUrl: './back-to-base-map.component.html',
	styleUrls: ['./back-to-base-map.component.less']
})
@AutoSubscriptions()
export class BackToBaseMapComponent implements OnInit, OnDestroy, IEntryComponent {
	static showFirst = true;
	@Input() mapId: string;
	mapsAmount: number;
	overlay: any;
	isPinned: boolean;

	@AutoSubscription
	isPinned$: Observable<boolean> = this.store$.pipe(
		select(selectIsPinned),
		tap(isPinned => this.isPinned = isPinned)
	);

	@AutoSubscription
	mapsAmount$ = this.store$.pipe(
		select(selectMapsTotal),
		tap((mapsAmount) => this.mapsAmount = mapsAmount)
	);

	@AutoSubscription
	overlay$: Observable<Dictionary<IMapSettings>> = this.store$.pipe(
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

	getType(): string {
		return 'buttons';
	}

	backToWorldView() {
		this.store$.dispatch(new BackToWorldView({ mapId: this.mapId }));
	}
}
