import { BaseImageryPlugin, ImageryPlugin } from '@ansyn/imagery';
import { AutoSubscription } from 'auto-subscriptions';
import { OpenLayersDisabledMap, OpenLayersMap } from '@ansyn/ol';
import { selectOverlayByMapId } from '@ansyn/map-facade';
import { select, Store } from '@ngrx/store';
import { take, tap } from 'rxjs/operators';
import { IOverlay } from '../../../../../overlays/models/overlay.model';
import { AnaglyphSensorService } from '../service/anaglyph-sensor.service';
import { AddAlertMsg, RemoveAlertMsg } from '../../../../../overlays/overlay-status/actions/overlay-status.actions';

export const anaglyphSensorAlertKey = 'anaglyphSensor';

@ImageryPlugin({
	supported: [OpenLayersMap, OpenLayersDisabledMap],
	deps: [Store, AnaglyphSensorService]
})
export class AnaglyphSensorPlugin extends BaseImageryPlugin {

	overlay: IOverlay = null;

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
							overlayId: overlay.id
						}));
					} else {
						this.store$.dispatch(new RemoveAlertMsg({
							key: anaglyphSensorAlertKey,
							overlayId: overlay.id
						}));
					}
				});
			}
		})
	);

	constructor(public store$: Store<any>,
				protected anaglyphSensorService: AnaglyphSensorService) {
		super();
	}
}
