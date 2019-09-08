import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { selectMapsTotal, selectOverlayByMapId } from '@ansyn/map-facade';
import { select, Store } from '@ngrx/store';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { Observable } from 'rxjs';
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
	mapsAmount$ = this.store$.pipe(
		select(selectMapsTotal),
		tap((mapsAmount) => this.mapsAmount = mapsAmount)
	);


	@AutoSubscription
	alertMsg$: Observable<AlertMsg> = this.store$
		.pipe(
			select(selectAlertMsg),
			tap((alertMsg) => this.alertMsg = alertMsg),
			distinctUntilChanged()
		);

	@AutoSubscription
	overlay$ = () => this.store$.pipe(
		select(selectOverlayByMapId(this.mapId)),
		tap((overlay) => {
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
