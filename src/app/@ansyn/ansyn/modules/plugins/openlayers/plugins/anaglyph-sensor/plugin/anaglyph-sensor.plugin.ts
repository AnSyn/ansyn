import { BaseImageryPlugin, ImageryPlugin } from '@ansyn/imagery';
import { AutoSubscription } from 'auto-subscriptions';
import { OpenLayersDisabledMap, OpenLayersMap } from '@ansyn/imagery-ol';
import { selectOverlayByMapId } from '@ansyn/map-facade';
import { select, Store } from '@ngrx/store';
import { take, tap } from 'rxjs/operators';
import { IOverlay } from '../../../../../overlays/models/overlay.model';
import { AnaglyphSensorService } from '../service/anaglyph-sensor.service';
import { AddAlertMsg, RemoveAlertMsg } from '../../../../../overlays/overlay-status/actions/overlay-status.actions';
import { selectAlertMsg } from '../../../../../overlays/overlay-status/reducers/overlay-status.reducer';
import { Injectable } from '@angular/core';

export const anaglyphSensorAlertKey = 'anaglyphSensor';

@ImageryPlugin({
	supported: [OpenLayersMap, OpenLayersDisabledMap],
	deps: [Store, AnaglyphSensorService]
})
@Injectable()
export class AnaglyphSensorPlugin extends BaseImageryPlugin {
	anglyphMsg: boolean;
	overlay: IOverlay = null;


	@AutoSubscription
	anaglyphSensorAlert$ = this.store$.select(selectAlertMsg).pipe(
		tap( alertMsg => {
			const anglyphMsgs = alertMsg.get(anaglyphSensorAlertKey);
			this.anglyphMsg = anglyphMsgs && anglyphMsgs.has(this.mapId);
		})
	);

	@AutoSubscription
	overlay$ = () => this.store$.pipe(
		select(selectOverlayByMapId(this.mapId)),
		tap((overlay: IOverlay) => {
			this.overlay = overlay;
			if (Boolean(overlay)) {
				this.anaglyphSensorService.isSupprotedOverlay(overlay).pipe(take(1)).subscribe((isSupproted: boolean) => {
					this.isEnabled = isSupproted;
					if (isSupproted) {
						this.store$.dispatch(new AddAlertMsg({
							key: anaglyphSensorAlertKey,
							value: this.mapId
						}));
					} else if (this.anglyphMsg) {
						this.store$.dispatch(new RemoveAlertMsg({
							key: anaglyphSensorAlertKey,
							value: this.mapId
						}));
					}
				});
			}
			else if (this.anglyphMsg) {
				this.store$.dispatch(new RemoveAlertMsg({ key: anaglyphSensorAlertKey, value: this.mapId }));
			}

		})
	);

	constructor(public store$: Store<any>,
				protected anaglyphSensorService: AnaglyphSensorService) {
		super();
	}
}
