import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ImageryCommunicatorService, extentFromGeojson } from '@ansyn/imagery';
import { take, tap } from 'rxjs/operators';
import { IEntryComponent, selectMaps } from '@ansyn/map-facade';
import { ICaseMapState } from '../../modules/menu-items/cases/models/case.model';
import { AutoSubscriptions, AutoSubscription } from 'auto-subscriptions';
import { Store, select } from '@ngrx/store';

@Component({
	selector: 'ansyn-overlay-out-of-bounds',
	templateUrl: './overlay-out-of-bounds.component.html',
	styleUrls: ['./overlay-out-of-bounds.component.less']
})
@AutoSubscriptions()
export class OverlayOutOfBoundsComponent implements OnInit, OnDestroy, IEntryComponent {
	@Input() mapId: string;
	mapState: ICaseMapState;

	@AutoSubscription
	mapState$ = this.store.pipe(
		select(selectMaps),
		tap((maps) => this.mapState = maps[this.mapId])
	);

	backToExtent(): void {
		const communicator = this.communicatorService.provide(this.mapState.id);
		const extent = extentFromGeojson(this.mapState.data.overlay.footprint);
		communicator.ActiveMap.fitToExtent(extent)
			.pipe(take(1))
			.subscribe();
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}

	constructor(protected communicatorService: ImageryCommunicatorService, public store: Store<any>) {
	}
}
