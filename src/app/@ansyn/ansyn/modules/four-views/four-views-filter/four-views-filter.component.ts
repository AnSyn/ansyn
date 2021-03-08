import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { SetFourViewsModeAction, SetToastMessageAction } from '@ansyn/map-facade';
import { IFourViewsConfig, fourViewsConfig } from '../../overlays/models/overlay.model';
import { SetFourViewsSensorsAction } from '../../status-bar/actions/status-bar.actions';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { selectFourViewsPoint } from '../../../../map-facade/reducers/map.reducer';
import { tap } from 'rxjs/operators';
import { Point } from 'geojson';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'ansyn-four-views-filter',
	templateUrl: './four-views-filter.component.html',
	styleUrls: ['./four-views-filter.component.less']
})

@AutoSubscriptions()
export class FourViewsFilterComponent implements OnInit, OnDestroy {
	sensors: string[];
	fourViewsPoint: Point;

	@AutoSubscription
	fourViewsPoint$ = this.store$.select(selectFourViewsPoint).pipe(
		tap(fourViewsPoint => fourViewsPoint)
	);

	constructor(protected store$: Store, @Inject(fourViewsConfig) public fourViewsConfig: IFourViewsConfig, protected translateService: TranslateService) {
		this.sensors = fourViewsConfig.sensors.slice();
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}

	onSensorChanged(selectedSensor: string, isSelected: boolean): void {
		if (isSelected) {
			this.sensors.push(selectedSensor);
		} else {
			this.removeSelectedSensor(selectedSensor);
		}

		this.store$.dispatch(new SetFourViewsSensorsAction(this.sensors.slice()));
	}

	removeSelectedSensor(selectedSensor: string): void {
		const index = this.sensors.indexOf(selectedSensor);
		this.sensors.splice(index, 1);
	}

	searchFourViewsOverlays(): void {
		if (this.sensors.length) {
			this.store$.dispatch(new SetFourViewsModeAction({ active: true, point: this.fourViewsPoint }))
		} else {
			const toastText = this.translateService.instant('Please pick at least one sensor');
			this.store$.dispatch(new SetToastMessageAction({ toastText }))
		}
	}
}
