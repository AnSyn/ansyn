import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import * as moment from 'moment';
import { IStatusBarConfig, IToolTipsConfig } from '../../models/statusBar-config.model';
import { IGeoFilterStatus, IStatusBarState, selectGeoFilterStatus } from '../../reducers/status-bar.reducer';
import { StatusBarConfig } from '../../models/statusBar.config';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
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
export class SearchPanelComponent implements OnInit, OnDestroy {

	time$: Observable<ICaseTimeState> = this.store$.select(selectTime);
	geoFilterStatus: IGeoFilterStatus;
	geoFilterStatus$ = this.store$.select(selectGeoFilterStatus).pipe(tap((geoFilterStatus: IGeoFilterStatus) => this.geoFilterStatus = geoFilterStatus));
	regionType: CaseGeoFilter;
	regionType$ = this.store$.select(selectRegion).pipe(
		filter(Boolean),
		map((region) => region.type),
		tap((regionType) => this.regionType = regionType)
	);
	dataInputFilterExpand: boolean;
	timeSelectionExpand: boolean;
	favoriteOverlays: IOverlay[];
	time: ICaseTimeState;
	dataInputFilterTitle = 'All';
	timeSelectionTitle: string;
	dataInputFilters: ICaseDataInputFiltersState;
	dataInputFilters$ = this.store$.select(selectDataInputFilter).pipe(
		filter((caseDataInputFiltersState: ICaseDataInputFiltersState) => Boolean(caseDataInputFiltersState) && Boolean(caseDataInputFiltersState.filters)),
		tap((caseDataInputFiltersState: ICaseDataInputFiltersState) => {
			this.dataInputFilters = caseDataInputFiltersState;
		})
	);
	private subscriptions = [];

	constructor(protected store$: Store<IStatusBarState>,
				@Inject(StatusBarConfig) protected statusBarConfig: IStatusBarConfig,
				@Inject(ORIENTATIONS) public orientations: CaseOrientation[],
				@Inject(TIME_FILTERS) public timeFilters: CaseTimeFilter[],
				@Inject(GEO_FILTERS) public geoFilters: CaseGeoFilter[]) {
	}

	get geoFilter() {
		return this.geoFilterStatus.searchMode !== SearchModeEnum.none ? this.geoFilterStatus.searchMode : this.regionType;
	}

	get toolTips(): IToolTipsConfig {
		return this.statusBarConfig.toolTips || {};
	}

	ngOnInit() {
		this.subscriptions.push(
			this.time$.subscribe(_time => {
				this.time = _time;
				if (_time && _time.to && _time.from) {
					const format = 'DD/MM/YYYY HH:mm';
					this.timeSelectionTitle = `${ moment(this.time.to).format(format) } - ${ moment(this.time.from).format(format) }`;
				}
			}),

			this.dataInputFilters$.subscribe(),

			this.geoFilterStatus$.subscribe(),

			this.regionType$.subscribe()
		);

	}

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

	toggleMapSearch() {
		const value = this.geoFilterStatus.searchMode !== SearchModeEnum.none ? SearchModeEnum.none : this.regionType;
		this.geoFilterChanged(value);
	}

	toggleIndicatorView() {
		this.store$.dispatch(new UpdateGeoFilterStatus({ indicator: !this.geoFilterStatus.indicator }));
	}

	geoFilterChanged(geoFilter?: SearchMode) {
		const payload: Partial<IGeoFilterStatus> = { searchMode: geoFilter };

		if (Boolean(geoFilter)) {
			payload.indicator = true;
		}

		this.store$.dispatch(new ClearActiveInteractionsAction({ skipClearFor: [UpdateGeoFilterStatus] }));
		this.store$.dispatch(new UpdateGeoFilterStatus({ searchMode: geoFilter }));
	}

	ngOnDestroy() {
		this.subscriptions.forEach((sub) => sub.unsubscribe());
	}

	updateDataInputTitle(title) {
		this.dataInputFilterTitle = title;
	}

}
