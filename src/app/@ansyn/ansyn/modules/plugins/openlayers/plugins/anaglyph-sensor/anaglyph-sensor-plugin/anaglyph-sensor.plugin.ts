import Vector from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import VectorLayer from 'ol/layer/Vector';
import { ImageryMapPosition } from '@ansyn/imagery';
import { combineLatest, Observable, of, pipe } from 'rxjs';
import { BaseImageryMap, BaseImageryPlugin, ImageryPlugin } from '@ansyn/imagery';
import { AutoSubscription } from 'auto-subscriptions';
import { OpenLayersDisabledMap, OpenLayersMap } from '@ansyn/ol';
import { selectScannedAreaData } from '../../../../../overlays/overlay-status/reducers/overlay-status.reducer';
import { selectOverlayFromMap } from '@ansyn/map-facade';
import { select, Store } from '@ngrx/store';
import { filter, take, tap } from 'rxjs/operators';
import { IOverlay } from '../../../../../overlays/models/overlay.model';
import { AnaglyphSensorService } from '../anaglyph-sensor-service/anaglyph-sensor.service';
import { AddAlertMsg, RemoveAlertMsg } from '../../../../../overlays/overlay-status/actions/overlay-status.actions';
import { AlertMsgTypes } from '../../../../../alerts/model';

@ImageryPlugin({
	supported: [OpenLayersMap, OpenLayersDisabledMap],
	deps: [Store, AnaglyphSensorService]
})
export class AnaglyphSensorPlugin extends BaseImageryPlugin {

	overlay: IOverlay = null;

	@AutoSubscription
	overlay$ = () => this.store$.pipe(
		select(selectOverlayFromMap(this.mapId)),
		tap((overlay: IOverlay) => {
			this.overlay = overlay;
			if (Boolean(overlay)) {
				this.anaglyphSensorService.isSupprotedOverlay(overlay).pipe(take(1)).subscribe((isSupproted: boolean) => {
					this.isEnabled = isSupproted;
					if (isSupproted) {
						this.store$.dispatch(new AddAlertMsg({ key: AlertMsgTypes.anaglyphSensor, value: this.mapId }));
					} else {
						this.store$.dispatch(new RemoveAlertMsg({ key: AlertMsgTypes.anaglyphSensor, value: this.mapId }));
					}
				});
			} else {
				this.store$.dispatch(new RemoveAlertMsg({ key: AlertMsgTypes.anaglyphSensor, value: this.mapId }));
			}

		})
	);

	onResetView() {
		this.store$.dispatch(new RemoveAlertMsg({ key: AlertMsgTypes.anaglyphSensor, value: this.mapId }));
		return super.onResetView();
	}

	onDispose(): void {
		this.store$.dispatch(new RemoveAlertMsg({ key: AlertMsgTypes.anaglyphSensor, value: this.mapId }));
		super.onDispose();

	}

	constructor(public store$: Store<any>,
				protected anaglyphSensorService: AnaglyphSensorService) {
		super();
	}
}
