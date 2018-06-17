import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { IStatusBarConfig, IToolTipsConfig } from '@ansyn/status-bar/models/statusBar-config.model';
import {
	GeoFilterStatus,
	IStatusBarState,
	selectComboBoxesProperties,
	selectGeoFilterStatus
} from '@ansyn/status-bar/reducers/status-bar.reducer';
import { StatusBarConfig } from '@ansyn/status-bar/models/statusBar.config';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import {
	ComboBoxesProperties,
	GEO_FILTERS,
	ORIENTATIONS,
	TIME_FILTERS
} from '@ansyn/status-bar/models/combo-boxes.model';
import {
	CoreActionTypes,
	SetLayoutAction,
	SetOverlaysCriteriaAction,
	UpdateOverlaysCountAction
} from '@ansyn/core/actions/core.actions';
import {
	CaseDataInputFiltersState,
	CaseGeoFilter,
	CaseOrientation,
	CaseTimeFilter,
	CaseTimeState
} from '@ansyn/core/models/case.model';
import { LayoutKey, layoutOptions } from '@ansyn/core/models/layout-options.model';
import { Overlay, OverlaysCriteria } from '@ansyn/core/models/overlay.model';
import {
	selectDataInputFilter,
	selectLayout,
	selectOverlaysCriteria,
	selectRegion
} from '@ansyn/core/reducers/core.reducer';
import { CaseDataFilterTitle } from '@ansyn/status-bar/models/data-input-filters.model';
import { Actions } from '@ngrx/effects';
import { SetComboBoxesProperties, UpdateGeoFilterStatus } from '@ansyn/status-bar/actions/status-bar.actions';
import { animate, style, transition, trigger } from '@angular/animations';
import { AnimationTriggerMetadata } from '@angular/animations/src/animation_metadata';

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
	selector: 'ansyn-combo-boxes',
	templateUrl: './combo-boxes.component.html',
	styleUrls: ['./combo-boxes.component.less'],
	animations: [fadeAnimations]
})
export class ComboBoxesComponent implements OnInit, OnDestroy {
	comboBoxesProperties$: Observable<ComboBoxesProperties> = this.store.select(selectComboBoxesProperties);
	geoFilterStatus$ = this.store.select(selectGeoFilterStatus).do((geoFilterStatus: GeoFilterStatus) => this.geoFilterStatus = geoFilterStatus);

	regionType$ = this.store.select(selectRegion).filter(Boolean).map((region) => region.type).do((regionType) => this.regionType = regionType);
	overlaysCriteria$: Observable<OverlaysCriteria> = this.store.select(selectOverlaysCriteria);
	time$: Observable<CaseTimeState> = this.overlaysCriteria$
		.pluck<OverlaysCriteria, CaseTimeState>('time')
		.distinctUntilChanged();
	layout$: Observable<LayoutKey> = this.store.select(selectLayout);

	dataInputFilters$ = this.store.select(selectDataInputFilter)
		.filter((caseDataInputFiltersState: CaseDataInputFiltersState) => Boolean(caseDataInputFiltersState) && Boolean(caseDataInputFiltersState.filters))
		.do((caseDataInputFiltersState: CaseDataInputFiltersState) => {
			this.dataInputFiltersTitle = !caseDataInputFiltersState.active ? CaseDataFilterTitle.Disabled : caseDataInputFiltersState.fullyChecked ? CaseDataFilterTitle.Full : CaseDataFilterTitle.Partial;
			this.dataInputFilters = caseDataInputFiltersState;
		});

	overlaysCount$: Observable<number> = this.actions$
		.ofType(CoreActionTypes.UPDATE_OVERLAY_COUNT)
		.map(({ payload }: UpdateOverlaysCountAction) => payload);

	geoFilterStatus: GeoFilterStatus;
	regionType: CaseGeoFilter;

	comboBoxesProperties: ComboBoxesProperties;
	dataInputFilterExpand: boolean;
	timeSelectionEditIcon: boolean;
	favoriteOverlays: Overlay[];
	layout: LayoutKey;
	time: CaseTimeState;

	dataInputFilters: CaseDataInputFiltersState;
	dataInputFiltersTitle: CaseDataFilterTitle = CaseDataFilterTitle.Disabled;
	private subscriptions = [];

	get geoFilter() {
		return this.geoFilterStatus.searchMode || this.regionType;
	}

	get toolTips(): IToolTipsConfig {
		return this.statusBarConfig.toolTips || {};
	}

	get layouts(): LayoutKey[] {
		return Array.from(layoutOptions.keys());
	}

	constructor(protected store: Store<IStatusBarState>,
				@Inject(StatusBarConfig) protected statusBarConfig: IStatusBarConfig,
				@Inject(ORIENTATIONS) public orientations: CaseOrientation[],
				@Inject(TIME_FILTERS) public timeFilters: CaseTimeFilter[],
				@Inject(GEO_FILTERS) public geoFilters: CaseGeoFilter[],
				protected actions$: Actions) {
	}

	ngOnInit() {
		this.subscriptions.push(
			this.layout$.subscribe((layout: LayoutKey) => this.layout = layout),

			this.time$.subscribe(_time => {
				this.time = _time;
			}),

			this.comboBoxesProperties$.subscribe((comboBoxesProperties) => {
				this.comboBoxesProperties = comboBoxesProperties;
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
			this.timeSelectionEditIcon = !this.timeSelectionEditIcon;
		}
	}

	applyTimelinePickerResult(time: CaseTimeState) {
		this.store.dispatch(new SetOverlaysCriteriaAction({ time }));
		this.toggleTimelineStartEndSearch();
	}

	layoutRender(layout: LayoutKey) {
		return `<i class="icon-screen-${this.layouts.indexOf(layout) + 1}" ></i>`;
	}

	layoutSelectChange(layout: LayoutKey): void {
		this.store.dispatch(new SetLayoutAction(layout));
	}

	toggleMapSearch() {
		const value = this.geoFilterStatus.searchMode ? CaseGeoFilter.none : this.regionType;
		this.geoFilterChanged(value);
	}

	toggleIndicatorView() {
		this.store.dispatch(new UpdateGeoFilterStatus({ indicator: !this.geoFilterStatus.indicator }));
	}

	comboBoxesChange(payload: ComboBoxesProperties) {
		this.store.dispatch(new SetComboBoxesProperties(payload));
	}

	geoFilterChanged(geoFilter?: CaseGeoFilter) {
		const payload: Partial<GeoFilterStatus> = { searchMode: geoFilter };

		if (Boolean(geoFilter)) {
			payload.indicator = true;
		}

		this.store.dispatch(new UpdateGeoFilterStatus({ searchMode: geoFilter }));
	}

	ngOnDestroy() {
		this.subscriptions.forEach((sub) => sub.unsubscribe());
	}
}
