import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import * as momentNs from 'moment';
import { IStatusBarConfig, IToolTipsConfig } from '../../models/statusBar-config.model';
import { IGeoFilterStatus, IStatusBarState, selectGeoFilterStatus } from '../../reducers/status-bar.reducer';
import { StatusBarConfig } from '../../models/statusBar.config';
import { Store } from '@ngrx/store';
import { Observable, combineLatest } from 'rxjs';
import { GEO_FILTERS, ORIENTATIONS, TIME_FILTERS } from '../../models/combo-boxes.model';
import { UpdateGeoFilterStatus } from '../../actions/status-bar.actions';
import { animate, style, transition, trigger } from '@angular/animations';
import { AnimationTriggerMetadata } from '@angular/animations/src/animation_metadata';
import { SearchMode, SearchModeEnum } from '../../models/search-mode.enum';
import { filter, map, tap } from 'rxjs/operators';
import { selectDataInputFilter, selectRegion, selectTime } from '../../../overlays/reducers/overlays.reducer';
import { SetOverlaysCriteriaAction } from '../../../overlays/actions/overlays.actions';
import {
	CaseGeoFilter,
	CaseOrientation,
	CaseTimeFilter,
	ICaseDataInputFiltersState,
	ICaseTimeState
} from '../../../menu-items/cases/models/case.model';
import { IOverlay } from '../../../overlays/models/overlay.model';
import { ClearActiveInteractionsAction } from '../../../menu-items/tools/actions/tools.actions';
import { AutoSubscriptions, AutoSubscription } from 'auto-subscriptions';

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

	geoFilterStatus: IGeoFilterStatus;
	dataInputFilterExpand: boolean;
	timeSelectionExpand: boolean;
	time: ICaseTimeState;
	dataInputFilterTitle = 'All';
	timeSelectionTitle: string;
	geoFilterTitle: string;
	dataInputFilters: ICaseDataInputFiltersState;

	@AutoSubscription
	time$: Observable<ICaseTimeState> = this.store$.select(selectTime).pipe(
		tap(_time => {
			this.time = _time;
			if (_time && _time.to && _time.from) {
				const format = 'DD/MM/YYYY HH:mm';
				this.timeSelectionTitle = `${ moment(this.time.to).format(format) } - ${ moment(this.time.from).format(format) }`;
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
		this.store$.select(selectGeoFilterStatus),
		this.store$.select(selectRegion)
	).pipe(
		tap(([geoFilterStatus, region]) => {
			this.geoFilterStatus = geoFilterStatus;
			const regionType = region && region.type;
			this.geoFilterTitle = geoFilterStatus.searchMode !== SearchModeEnum.none ? geoFilterStatus.searchMode : regionType;
		})
	);

	constructor(protected store$: Store<IStatusBarState>,
				@Inject(StatusBarConfig) public statusBarConfig: IStatusBarConfig,
				@Inject(GEO_FILTERS) public geoFilters: CaseGeoFilter[]) {
	}



	ngOnInit() { }

	toggleDataInputFilterIcon() {
		this.dataInputFilterExpand = !this.dataInputFilterExpand;
	}

	toggleTimelineStartEndSearch($event?: any) {
		if (!$event || !$event.path.map(({ classList }) => classList).filter(Boolean).some((classList) => classList.contains('flatpickr-calendar'))) {
			this.timeSelectionExpand = !this.timeSelectionExpand;
		}
	}

	applyTimelinePickerResult(time: ICaseTimeState) {
		this.store$.dispatch(new SetOverlaysCriteriaAction({ time }));
		this.toggleTimelineStartEndSearch();
	}

	geoFilterChanged(geoFilter?: SearchMode) {
		const payload: Partial<IGeoFilterStatus> = { searchMode: geoFilter };

		if (Boolean(geoFilter)) {
			payload.indicator = true;
		}

		this.store$.dispatch(new ClearActiveInteractionsAction({ skipClearFor: [UpdateGeoFilterStatus] }));
		this.store$.dispatch(new UpdateGeoFilterStatus({ searchMode: geoFilter }));
	}

	ngOnDestroy() {	}

	updateDataInputTitle(title) {
		this.dataInputFilterTitle = title;
	}

}
