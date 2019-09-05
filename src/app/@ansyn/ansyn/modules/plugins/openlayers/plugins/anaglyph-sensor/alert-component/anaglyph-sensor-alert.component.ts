import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IMapSettings } from '@ansyn/imagery';
import { take, tap } from 'rxjs/operators';
import { IEntryComponent, selectMapStateById } from '@ansyn/map-facade';
import { AutoSubscriptions, AutoSubscription } from 'auto-subscriptions';
import { Store, select } from '@ngrx/store';
import { AnaglyphSensorService } from '../service/anaglyph-sensor.service';

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
	mapState$ = () => this.store.pipe(
		select(selectMapStateById(this.mapId)),
		tap((mapSetings: IMapSettings) => this.mapState = mapSetings)
	);

	ShowAnaglyph(): void {
		this.anaglyphSensorService.displayAnaglyph(this.mapState, this.mapState.data.overlay).pipe(take(1)).subscribe((res) => {
			if (res) {
				this.mode = AnaglyphComponentMode.ShowOriginal;
			}
		});
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
				protected anaglyphSensorService: AnaglyphSensorService) {
		this.mode = AnaglyphComponentMode.ShowAnaglyph;
	}

	getType(): string {
		return '';
	}
}
