import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { bboxFromGeoJson, ImageryCommunicatorService } from '@ansyn/imagery';
import { take, tap } from 'rxjs/operators';
import { IEntryComponent, selectMapsTotal } from '@ansyn/map-facade';
import { select, Store } from '@ngrx/store';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';

@Component({
	selector: 'ansyn-overlay-out-of-bounds',
	templateUrl: './overlay-out-of-bounds.component.html',
	styleUrls: ['./overlay-out-of-bounds.component.less']
})
@AutoSubscriptions()
export class OverlayOutOfBoundsComponent implements OnInit, OnDestroy, IEntryComponent {
	@Input() mapId: string;
	mapsAmount: number;
	color = '#0091ff';

	@AutoSubscription
	mapAmount$ = this.store.pipe(
		select(selectMapsTotal),
		tap( (mapsAmount) => this.mapsAmount = mapsAmount)
	);

	constructor(protected communicatorService: ImageryCommunicatorService, public store: Store<any>) {
	}

	backToExtent(): void {
		const communicator = this.communicatorService.provide(this.mapId);
		const extent = bboxFromGeoJson(communicator.mapSettings.data.overlay.footprint);
		communicator.ActiveMap.fitToExtent(extent)
			.pipe(take(1))
			.subscribe();
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}

	getType(): string {
		return '';
	}
}
