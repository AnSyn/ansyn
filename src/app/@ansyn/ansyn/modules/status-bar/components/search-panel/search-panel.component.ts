import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as momentNs from 'moment';
import { IStatusBarConfig } from '../../models/statusBar-config.model';
import {
	IStatusBarState, selectGeoFilterActive,
	selectGeoFilterType
} from '../../reducers/status-bar.reducer';
import { StatusBarConfig } from '../../models/statusBar.config';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';
import { AnimationTriggerMetadata } from '@angular/animations/src/animation_metadata';
import { filter, tap, withLatestFrom } from 'rxjs/operators';
import { selectDataInputFilter, selectRegion, selectTime } from '../../../overlays/reducers/overlays.reducer';
import { ICaseDataInputFiltersState, ICaseTimeState } from '../../../menu-items/cases/models/case.model';
import { DateTimeAdapter } from '@ansyn/ng-pick-datetime';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';

const moment = momentNs;

const fadeAnimations: AnimationTriggerMetadata = trigger('fade', [
	transition(':enter', [
		style({ opacity: 0, transform: 'translateY(-100%)' }),
		animate('0.2s', style({ opacity: 1, transform: 'translateY(calc(-100% - 15px))' }))
	]),
	transition(':leave', [
		style({ opacity: 1, transform: 'translateY(calc(-100% - 15px))' }),
		animate('0.2s', style({ opacity: 0, transform: 'translateY(-100%)' }))
	])
]);

@Component({
	selector: 'ansyn-search-panel',
	templateUrl: './search-panel.component.html',
	styleUrls: ['./search-panel.component.less'],
	animations: [fadeAnimations]
})
@AutoSubscriptions()
export class SearchPanelComponent implements OnInit, OnDestroy {

	dataInputFilterExpand: boolean;
	timePickerExpand: boolean;
	locationPickerExpand: boolean;
	timeRange: Date[];
	dataInputFilterTitle = 'All';
	timeSelectionTitle: string;
	geoFilterTitle: string;
	dataInputFilters: ICaseDataInputFiltersState;

	@AutoSubscription
	time$: Observable<ICaseTimeState> = this.store$.select(selectTime).pipe(
		tap(_time => {
			this.timeRange = _time && [_time.from, _time.to];
			if (_time && _time.to && _time.from) {
				const format = 'DD/MM/YYYY HH:mm';
				this.timeSelectionTitle = `${ moment(this.timeRange[0]).format(format) } - ${ moment(this.timeRange[1]).format(format) }`;
			}
		})
	);

	@AutoSubscription
	dataInputFilters$ = this.store$.select(selectDataInputFilter).pipe(
		filter((caseDataInputFiltersState: ICaseDataInputFiltersState) => Boolean(caseDataInputFiltersState) && Boolean(caseDataInputFiltersState.filters)),
		tap((caseDataInputFiltersState: ICaseDataInputFiltersState) => {
			this.dataInputFilters = caseDataInputFiltersState;
		})
	);

	@AutoSubscription
	geoFilter$ = combineLatest(
		this.store$.select(selectGeoFilterType),
		this.store$.select(selectGeoFilterActive)
	).pipe(
		withLatestFrom(this.store$.select(selectRegion)),
		tap(([[geoFilterType, active], region]) => {
			this.geoFilterTitle = `${geoFilterType} (${region.coordinates.toString()})`;
			this.locationPickerExpand = active;
		})
	);

	constructor(protected store$: Store<IStatusBarState>,
				@Inject(StatusBarConfig) public statusBarConfig: IStatusBarConfig,
				dateTimeAdapter: DateTimeAdapter<any>
	) {
		dateTimeAdapter.setLocale(statusBarConfig.locale);
	}


	ngOnInit() {
	}

	toggleDataInputFilter() {
		this.dataInputFilterExpand = !this.dataInputFilterExpand;
	}

	toggleTimePicker() {
		this.timePickerExpand = !this.timePickerExpand;
	}

	toggleLocationPicker() {
		this.locationPickerExpand = !this.locationPickerExpand;
	}

	ngOnDestroy() {
	}

	updateDataInputTitle(title) {
		this.dataInputFilterTitle = title;
	}

}
