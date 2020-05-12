import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import * as momentNs from 'moment';
import { IStatusBarConfig } from '../../models/statusBar-config.model';
import { IStatusBarState, selectGeoFilterActive, selectGeoFilterType } from '../../reducers/status-bar.reducer';
import { StatusBarConfig } from '../../models/statusBar.config';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, fromEvent } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';
import { AnimationTriggerMetadata } from '@angular/animations/src/animation_metadata';
import { filter, tap } from 'rxjs/operators';
import { selectDataInputFilter, selectRegion, selectTime } from '../../../overlays/reducers/overlays.reducer';
import { ICaseDataInputFiltersState, ICaseTimeState } from '../../../menu-items/cases/models/case.model';
import { DateTimeAdapter } from '@ansyn/ng-pick-datetime';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import {
	IMultipleOverlaysSourceConfig, IOverlaysSourceProvider,
	MultipleOverlaysSourceConfig
} from '../../../core/models/multiple-overlays-source-config';
import { SetToastMessageAction } from '@ansyn/map-facade';

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

type SearchPanelTitle = 'DataInputs' | 'TimePicker' | 'TimePickerPreset' | 'LocationPicker';

@Component({
	selector: 'ansyn-search-panel',
	templateUrl: './search-panel.component.html',
	styleUrls: ['./search-panel.component.less'],
	animations: [fadeAnimations]
})
@AutoSubscriptions()
export class SearchPanelComponent implements OnInit, OnDestroy {
	popupExpanded = new Map<SearchPanelTitle, boolean>([['DataInputs', false], ['TimePicker', false], ['LocationPicker', false], ['TimePickerPreset', false]]);
	timeRange: Date[];
	dataInputFilterTitle: string;
	timeSelectionTitle: string;
	geoFilterTitle: string;
	geoFilterCoordinates: string;
	dataInputFilters: ICaseDataInputFiltersState;

	@AutoSubscription
	time$: Observable<ICaseTimeState> = this.store$.select(selectTime).pipe(
		tap(_time => {
			this.timeRange = _time && [_time.from, _time.to];
			if (_time && _time.to && _time.from) {
				const format = 'DD/MM/YYYY HH:mm';
				this.timeSelectionTitle = `${ moment(this.timeRange[0]).format(format) }&nbsp;&nbsp;-&nbsp;&nbsp;${ moment(this.timeRange[1]).format(format) }`;
			}
		})
	);

	@AutoSubscription
	dataInputFilters$ = this.store$.select(selectDataInputFilter).pipe(
		filter((caseDataInputFiltersState: ICaseDataInputFiltersState) => Boolean(caseDataInputFiltersState) && Boolean(caseDataInputFiltersState.filters)),
		tap((caseDataInputFiltersState: ICaseDataInputFiltersState) => {
			this.dataInputFilters = caseDataInputFiltersState;
			const selectedFiltersSize = this.dataInputFilters.filters.length;
			const dataInputsSize = Object.values(this.multipleOverlaysSourceConfig.indexProviders).filter(({inActive}: IOverlaysSourceProvider) => !inActive).length;
			this.dataInputFilterTitle = this.dataInputFilters.fullyChecked ? 'All' : `${selectedFiltersSize}/${dataInputsSize}`;
			if (!caseDataInputFiltersState.fullyChecked && caseDataInputFiltersState.filters.length === 0) {
				this.popupExpanded.set('DataInputs', true)
			}
		})
	);

	@AutoSubscription
	geoFilter$ = combineLatest(
		this.store$.select(selectGeoFilterType),
		this.store$.select(selectGeoFilterActive)
	).pipe(
		tap(([geoFilterType, active]) => {
			this.geoFilterTitle = `${ geoFilterType }`;
			this.popupExpanded.set('LocationPicker', active);
		})
	);

	@AutoSubscription
	updateGeoFilterCoordinates$ = this.store$.select(selectRegion).pipe(
		filter(Boolean),
		tap(({ coordinates }) => this.geoFilterCoordinates = coordinates.toString())
	);

	constructor(protected store$: Store<IStatusBarState>,
				@Inject(StatusBarConfig) public statusBarConfig: IStatusBarConfig,
				@Inject(MultipleOverlaysSourceConfig) private multipleOverlaysSourceConfig: IMultipleOverlaysSourceConfig,
				dateTimeAdapter: DateTimeAdapter<any>
	) {
		dateTimeAdapter.setLocale(statusBarConfig.locale);
	}


	ngOnInit() {
	}

	closeTimePicker() {
		this.popupExpanded.set('TimePicker', false);
		this.popupExpanded.set('TimePickerPreset', false);
	}

	toggleExpander(popup: SearchPanelTitle) {
		if (this.isDataInputsOk()) {
			const newState = !this.popupExpanded.get(popup);
			this.popupExpanded.forEach((_, key, map) => {
				map.set(key , key === popup ? newState : false)
			});
		}
		else {
			this.store$.dispatch(new SetToastMessageAction({toastText: 'Please select at least one type', showWarningIcon: true}));

		}
	}

	isActive(popup: SearchPanelTitle) {
		return this.popupExpanded.get(popup);
	}

	ngOnDestroy() {
	}

	isDataInputsOk() {
		return this.dataInputFilters.fullyChecked || this.dataInputFilters.filters.length > 0;
	}
}
