import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { selectMapsTotal, selectOverlayByMapId } from '@ansyn/map-facade';
import { Store } from '@ngrx/store';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, tap, filter } from 'rxjs/operators';
import { IOverlay } from '../../../overlays/models/overlay.model';
import { selectAlertMsg } from '../../../overlays/overlay-status/reducers/overlay-status.reducer';
import { ALERTS, IAlert } from '../../alerts.model';

@Component({
	selector: 'ansyn-alerts-container',
	templateUrl: './alerts-container.component.html',
	styleUrls: ['./alerts-container.component.less']
})
@AutoSubscriptions()
export class AlertsContainerComponent implements OnInit, OnDestroy {

	alertMsg: IAlert[];
	overlay: IOverlay;
	@Input() mapId: string;

	@AutoSubscription
	alertMsg$: () => Observable<any> = () => combineLatest(this.store$.select(selectAlertMsg), this.store$.select(selectOverlayByMapId(this.mapId))).pipe(
		distinctUntilChanged(),
		filter(([alertMsg, overlay]) => Boolean(alertMsg) && Boolean(overlay)),
		tap(([alertMsg, overlay]) => {
			const overlayAlerts = alertMsg.get(overlay && overlay.id);
			this.alertMsg = this.alerts.filter( alert => overlayAlerts && overlayAlerts.has(alert.key));
			this.overlay = overlay;
		})
	);

	constructor(protected store$: Store<any>,
				@Inject(ALERTS) public alerts: IAlert[]) {
	}

	ngOnInit() {
	}

	ngOnDestroy() {
	}

	getType() {
		return 'notification';
	}
}
