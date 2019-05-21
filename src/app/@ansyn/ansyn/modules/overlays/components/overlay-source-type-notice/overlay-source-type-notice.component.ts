import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { filter, tap, withLatestFrom } from 'rxjs/operators';
import { IOverlay } from '../../models/overlay.model';
import { IOverlaysConfig } from '../../models/overlays.config';
import { selectdisplayOverlayHistory, selectOverlaysMap } from '../../reducers/overlays.reducer';
import { OverlaysConfig } from '../../services/overlays.service';

@Component({
	selector: 'ansyn-overlay-source-type-notice',
	templateUrl: './overlay-source-type-notice.component.html',
	styleUrls: ['./overlay-source-type-notice.component.less']
})
@AutoSubscriptions()
export class OverlaySourceTypeNoticeComponent implements OnInit, OnDestroy {
	@Input() mapId: string;
	overlayHistory$ = this.store$.select(selectdisplayOverlayHistory);
	overlays$ = this.store$.select(selectOverlaysMap);
	@AutoSubscription
	overlay$ = this.overlayHistory$.pipe(
		withLatestFrom(this.overlays$),
		filter(([overlaysHistory, overlays]) => Boolean(overlaysHistory[this.mapId] && overlays)),
		tap(([overlaysHistory, overlays]) => {
			const lastOverlay = overlaysHistory[this.mapId][overlaysHistory[this.mapId].length - 1];
			this.overlay = overlays.get(lastOverlay);
		})
	);
	set overlay(newOverlay: IOverlay){
		let sourceTypeConfig;
		// Extract the title, according to the new overlay and the configuration
		this._title = newOverlay
			&& (sourceTypeConfig = this._config.sourceTypeNotices[newOverlay.sourceType])
			&& (sourceTypeConfig[newOverlay.sensorType] || sourceTypeConfig.Default);
		// Insert the photo year into the title, if requested
		if (this._title && newOverlay.date) {
			this._title = this._title.replace('$year', newOverlay.date.getFullYear().toString());
		}
	}
	private _title: string = null;
	get title() {
		return this._title;
	}

	constructor(protected store$: Store<any>,
				@Inject(OverlaysConfig) public _config: IOverlaysConfig) {
	}

	ngOnDestroy(): void {
	}

	ngOnInit(): void {
	}

}
