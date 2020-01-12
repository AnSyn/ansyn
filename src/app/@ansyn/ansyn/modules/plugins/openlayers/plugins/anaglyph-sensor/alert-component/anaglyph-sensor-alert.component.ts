import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { getPolygonIntersectionRatio, IMapSettings } from '@ansyn/imagery';
import { catchError, take, tap } from 'rxjs/operators';
import { IEntryComponent, selectMapStateById, SetToastMessageAction } from '@ansyn/map-facade';
import { AutoSubscriptions, AutoSubscription } from 'auto-subscriptions';
import { Store, select } from '@ngrx/store';
import { AnaglyphSensorService } from '../service/anaglyph-sensor.service';
import { isFullOverlay } from '../../../../../core/utils/overlays';
import { EMPTY } from 'rxjs';
import { getErrorLogFromException, getErrorMessageFromException } from '../../../../../core/utils/logs/timer-logs';
import { LoggerService } from '../../../../../core/services/logger.service';

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
	isDisabled: boolean;

	@AutoSubscription
	mapState$ = () => this.store.pipe(
		select(selectMapStateById(this.mapId)),
		tap((mapSetings: IMapSettings) => {
			this.mapState = mapSetings;
			this.isDisabled = this.getIsDisabledState();
		})
	);

	getIsDisabledState(): boolean {
		if (!Boolean(this.mapState)) {
			return true;
		}

		const overlay = this.mapState.data.overlay;
		if (!isFullOverlay(overlay)) {
			return true;
		}

		const viewExtent = this.mapState.data.position.extentPolygon;
		const intersection = getPolygonIntersectionRatio(viewExtent, overlay.footprint);
		return !Boolean(intersection);
	}

	ShowAnaglyph(): void {
		this.anaglyphSensorService.displayAnaglyph(this.mapState).pipe(
			take(1),
			catchError((error) => {
				this.loggerService.error(getErrorLogFromException(error, 'stereo failed'), 'Anaglyph');
				this.store.dispatch(SetToastMessageAction({
					toastText: getErrorMessageFromException(error, 'stereo failed'),
					showWarningIcon: true
				}));
				return EMPTY;
			})
		).subscribe((res) => {
			if (res) {
				this.mode = AnaglyphComponentMode.ShowOriginal;
			}
		});
	}

	ShowOriginal(): void {
		this.anaglyphSensorService.displayOriginalOverlay(this.mapState).pipe(take(1)).subscribe((res) => {
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
				protected anaglyphSensorService: AnaglyphSensorService,
				protected loggerService: LoggerService) {
		this.mode = AnaglyphComponentMode.ShowAnaglyph;
		this.isDisabled = true;
	}

	getType(): string {
		return '';
	}
}
