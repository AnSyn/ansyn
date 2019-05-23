import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { selectMaps, selectMapsTotal } from '@ansyn/map-facade';
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
	static TYPE = 'notification';
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
	overlay$ = this.store$.pipe(
		select(selectMaps),
		tap((maps) => {
			if (maps[this.mapId]) {
				this.overlay = maps[this.mapId].data.overlay;
			}
		})
	);

	@AutoSubscription
	alertMsg$: Observable<AlertMsg> = this.store$
		.pipe(
			select(selectAlertMsg),
			tap((alertMsg) => this.alertMsg = alertMsg),
			distinctUntilChanged()
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

	ngOnInit() {
	}

	ngOnDestroy() {
	}

}
