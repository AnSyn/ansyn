import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { selectMapsTotal, selectOverlayByMapId } from '@ansyn/map-facade';
import { Store } from '@ngrx/store';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, tap } from 'rxjs/operators';
import { IOverlay } from '../../../overlays/models/overlay.model';
import { selectAlertMsg } from '../../../overlays/overlay-status/reducers/overlay-status.reducer';
import { ALERTS, IAlert } from '../../alerts.model';
import { AlertMsg } from '../../model';

@Component({
	selector: 'ansyn-alerts-container',
	templateUrl: './alerts-container.component.html',
	styleUrls: ['./alerts-container.component.less']
})
@AutoSubscriptions()
export class AlertsContainerComponent implements OnInit, OnDestroy {

	alertMsg: AlertMsg;
	overlay: IOverlay;
	mapsAmount: number;
	@Input() mapId: string;

	@AutoSubscription
	mapsAmount$ = this.store$.select(selectMapsTotal).pipe(
		tap((mapsAmount) => this.mapsAmount = mapsAmount)
	);

	@AutoSubscription
	alertMsg$: () => Observable<any> = () => combineLatest(this.store$.select(selectAlertMsg), this.store$.select(selectOverlayByMapId(this.mapId))).pipe(
		distinctUntilChanged(),
		tap(([alertMsg, overlay]) => {
			this.alertMsg = alertMsg;
			this.overlay = overlay;
		})
	);

	constructor(protected store$: Store<any>,
				@Inject(ALERTS) public alerts: IAlert[]) {
	}

	showAlert(alertKey) {
		const ids = this.alertMsg.get(alertKey);
		if (ids) {
			return ids.has(this.mapId);
		} else {
			return this[alertKey];
		}
	}

	get noGeoRegistration() {
		if (!this.overlay) {
			return false;
		}

		return this.overlay.isGeoRegistered === 'notGeoRegistered';
	}

	get poorGeoRegistered() {
		if (!this.overlay) {
			return false;
		}
		return this.overlay.isGeoRegistered === 'poorGeoRegistered';
	}

	ngOnInit() {
	}

	ngOnDestroy() {
	}

	getType() {
		return 'notification';
	}
}
