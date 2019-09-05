import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ImageryCommunicatorService, bboxFromGeoJson, IMapSettings } from '@ansyn/imagery';
import { take, tap } from 'rxjs/operators';
import { IEntryComponent, selectMaps } from '@ansyn/map-facade';
import { AutoSubscriptions, AutoSubscription } from 'auto-subscriptions';
import { Store, select } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { Dictionary } from '@ngrx/entity';
import { AnaglyphSensorService } from '../anaglyph-sensor-service/anaglyph-sensor.service';

export enum AnaglyphComponentMode {
	ShowAnaglyph,
	ShowOriginal
}

@Component({
	selector: 'ansyn-anaglyph-sensor-alert',
	templateUrl: './anaglyph-sensor-alert.component.html',
	styleUrls: ['./anaglyph-sensor-alert.component.less']
})
@AutoSubscriptions()
export class AnaglyphSensorAlertComponent implements OnInit, OnDestroy, IEntryComponent {
	@Input() mapId: string;
	mapState: IMapSettings;
	mode: AnaglyphComponentMode;

	@AutoSubscription
	mapState$: Observable<Dictionary<IMapSettings>> = this.store.pipe(
		select(selectMaps),
		tap((maps) => this.mapState = maps[this.mapId])
	);

	ShowAnaglyph(): void {
		this.anaglyphSensorService.displayAnaglyph(this.mapState, this.mapState.data.overlay).pipe(take(1)).subscribe((res) => {
			if (res) {
				this.mode = AnaglyphComponentMode.ShowOriginal;
			}
		});
		// const communicator = this.communicatorService.provide(this.mapState.id);
		// const extent = bboxFromGeoJson(this.mapState.data.overlay.footprint);
		// communicator.ActiveMap.fitToExtent(extent)
		// 	.pipe(take(1))
		// 	.subscribe();
	}

	ShowOriginal(): void {
		this.anaglyphSensorService.displayOriginalOverlay(this.mapState, this.mapState.data.overlay).pipe(take(1)).subscribe((res) => {
			if (res) {
				this.mode = AnaglyphComponentMode.ShowAnaglyph;
			}
		});
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}

	constructor(public store: Store<any>,
				protected communicatorService: ImageryCommunicatorService,
				protected anaglyphSensorService: AnaglyphSensorService) {
		this.mode = AnaglyphComponentMode.ShowAnaglyph;
	}

	getType(): string {
		return '';
	}
}
