import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { IStatusBarConfig, IToolTipsConfig } from '../../models/statusBar-config.model';
import {
	IGeoFilterStatus,
	IStatusBarState,
	selectComboBoxesProperties,
	selectGeoFilterStatus
} from '../../reducers/status-bar.reducer';
import { StatusBarConfig } from '../../models/statusBar.config';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { GEO_FILTERS, IComboBoxesProperties, ORIENTATIONS, TIME_FILTERS } from '../../models/combo-boxes.model';
import { Actions, ofType } from '@ngrx/effects';
import { SetImageOpeningOrientation, UpdateGeoFilterStatus } from '../../actions/status-bar.actions';
import { animate, style, transition, trigger } from '@angular/animations';
import { AnimationTriggerMetadata } from '@angular/animations/src/animation_metadata';
import { SearchMode, SearchModeEnum } from '../../models/search-mode.enum';
import { filter, map, tap } from 'rxjs/operators';
import { LayoutKey, layoutOptions, selectLayout, SetLayoutAction } from '@ansyn/map-facade';
import { selectDataInputFilter, selectRegion, selectTime } from '../../../overlays/reducers/overlays.reducer';
import {
	OverlaysActionTypes,
	SetOverlaysCriteriaAction,
	UpdateOverlaysCountAction
} from '../../../overlays/actions/overlays.actions';
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
	selector: 'ansyn-combo-boxes',
	templateUrl: './combo-boxes.component.html',
	styleUrls: ['./combo-boxes.component.less'],
	animations: [fadeAnimations]
})
export class ComboBoxesComponent implements OnInit, OnDestroy {
	comboBoxesProperties$: Observable<IComboBoxesProperties> = this.store$.select(selectComboBoxesProperties);
	geoFilterStatus$ = this.store$.select(selectGeoFilterStatus).pipe(tap((geoFilterStatus: IGeoFilterStatus) => this.geoFilterStatus = geoFilterStatus));

	regionType$ = this.store$.select(selectRegion).pipe(
		filter(Boolean),
		map((region) => region.type),
		tap((regionType) => this.regionType = regionType)
	);

	time$: Observable<ICaseTimeState> = this.store$.select(selectTime);
	layout$: Observable<LayoutKey> = this.store$.select(selectLayout);

	dataInputFilters$ = this.store$.select(selectDataInputFilter).pipe(
		filter((caseDataInputFiltersState: ICaseDataInputFiltersState) => Boolean(caseDataInputFiltersState) && Boolean(caseDataInputFiltersState.filters)),
		tap((caseDataInputFiltersState: ICaseDataInputFiltersState) => {
			this.dataInputFilters = caseDataInputFiltersState;
		})
	);

	overlaysCount$: Observable<number> = this.actions$.pipe(
		ofType(OverlaysActionTypes.UPDATE_OVERLAY_COUNT),
		map(({ payload }: UpdateOverlaysCountAction) => payload)
	);

	geoFilterStatus: IGeoFilterStatus;
	regionType: CaseGeoFilter;

	comboBoxesProperties: IComboBoxesProperties;
	dataInputFilterExpand: boolean;
	timeSelectionEditIcon: boolean;
	favoriteOverlays: IOverlay[];
	layout: LayoutKey;
	time: ICaseTimeState;
	timeRange: Date[];

	dataInputFilterTitle = 'All';
	dataInputFilters: ICaseDataInputFiltersState;
	private subscriptions = [];

	get SearchModeEnum() {
		return SearchModeEnum;
	}

	get geoFilter() {
		return this.geoFilterStatus.searchMode !== SearchModeEnum.none ? this.geoFilterStatus.searchMode : this.regionType;
	}

	get toolTips(): IToolTipsConfig {
		return this.statusBarConfig.toolTips || {};
	}

	get layouts(): LayoutKey[] {
		return Array.from(layoutOptions.keys());
	}

	constructor(protected store$: Store<IStatusBarState>,
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
				this.timeRange = _time && [_time.from, _time.to];
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

	onTimeRangeChange(event) {
		const time: ICaseTimeState = {
			from: event.value[0],
			to: event.value[1],
			type: 'absolute'
		};
		this.store$.dispatch(new SetOverlaysCriteriaAction({ time }));
	}

	layoutSelectChange(layout: LayoutKey): void {
		this.store$.dispatch(new SetLayoutAction(layout));
	}

	toggleMapSearch() {
		const value = this.geoFilterStatus.searchMode !== SearchModeEnum.none ? SearchModeEnum.none : this.regionType;
		this.geoFilterChanged(value);
	}

	toggleIndicatorView() {
		this.store$.dispatch(new UpdateGeoFilterStatus({ indicator: !this.geoFilterStatus.indicator }));
	}

	comboBoxesChange(payload: IComboBoxesProperties) {
		this.store$.dispatch(new SetImageOpeningOrientation(payload));
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
