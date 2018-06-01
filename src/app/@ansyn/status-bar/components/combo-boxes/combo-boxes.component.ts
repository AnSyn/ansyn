import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { IStatusBarConfig, IToolTipsConfig } from '@ansyn/status-bar/models/statusBar-config.model';
import {
	IStatusBarState,
	selectComboBoxesProperties,
	selectFlags
} from '@ansyn/status-bar/reducers/status-bar.reducer';
import { StatusBarConfig } from '@ansyn/status-bar/models/statusBar.config';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import {
	ComboBoxesProperties, GEO_FILTERS, ORIENTATIONS,
	TIME_FILTERS
} from '@ansyn/status-bar/models/combo-boxes.model';
import { statusBarFlagsItemsEnum } from '@ansyn/status-bar/models/status-bar-flag-items.model';
import {
	CoreActionTypes,
	SetLayoutAction,
	SetOverlaysCriteriaAction,
	UpdateOverlaysCountAction
} from '@ansyn/core/actions/core.actions';
import {
	CaseDataInputFiltersState, CaseGeoFilter, CaseOrientation, CaseTimeFilter, CaseTimeState,
	DataInputFilterValue
} from '@ansyn/core/models/case.model';
import { LayoutKey, layoutOptions } from '@ansyn/core/models/layout-options.model';
import { Overlay, OverlaysCriteria } from '@ansyn/core/models/overlay.model';
import { selectDataInputFilter, selectLayout, selectOverlaysCriteria } from '@ansyn/core/reducers/core.reducer';
import { CaseDataFilterTitle } from '@ansyn/status-bar/models/data-input-filters.model';
import { isEqual } from 'lodash';
import { TreeviewItem } from 'ngx-treeview';
import { Actions } from '@ngrx/effects';
import { SetComboBoxesProperties, UpdateStatusFlagsAction } from '@ansyn/status-bar/actions/status-bar.actions';
import { animate, style, transition, trigger } from '@angular/animations';
import { AnimationTriggerMetadata } from '@angular/animations/src/animation_metadata';

const fadeAnimations: AnimationTriggerMetadata = trigger('fade', [
	transition(':enter', [
		style({ opacity: 0, transform: 'translateY(-100%)' }),
		animate('0.2s', style({ opacity: 1, transform: 'translateY(calc(-100% - 15px))' }))
	]),
	transition(':leave', [
		style({ opacity: 1, transform: 'translateY(calc(-100% - 15px))'  }),
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
	flags$ = this.store.select(selectFlags);
	overlaysCriteria$: Observable<OverlaysCriteria> = this.store.select(selectOverlaysCriteria);
	time$: Observable<CaseTimeState> = this.overlaysCriteria$
		.pluck<OverlaysCriteria, CaseTimeState>('time')
		.distinctUntilChanged();
	layout$: Observable<LayoutKey> = this.store.select(selectLayout);

	dataInputFilters$ = this.store.select(selectDataInputFilter)
		.filter((caseDataInputFiltersState: CaseDataInputFiltersState) => Boolean(caseDataInputFiltersState) && Boolean(caseDataInputFiltersState.filters))
		.do((caseDataInputFiltersState: CaseDataInputFiltersState) => {
			const isFull = this.statusBarConfig.dataInputFiltersConfig.filters.every((filterConfig: TreeviewItem) => {
				return filterConfig.children.every((sensorTypeAndName: TreeviewItem) => {
					return caseDataInputFiltersState.filters.some((dataInputFilter: DataInputFilterValue) => {
						return isEqual(dataInputFilter, sensorTypeAndName.value);
					});
				});
			});
			this.dataInputFiltersTitle = !caseDataInputFiltersState.active ? CaseDataFilterTitle.Disabled : isFull ? CaseDataFilterTitle.Full : CaseDataFilterTitle.Partial;
			this.dataInputFilters = caseDataInputFiltersState;
		});

	overlaysCount$: Observable<number> = this.actions$
		.ofType(CoreActionTypes.UPDATE_OVERLAY_COUNT)
		.map(({ payload }: UpdateOverlaysCountAction) => payload);

	comboBoxesProperties: ComboBoxesProperties;
	dataInputFilterExpand: boolean;
	timeSelectionEditIcon: boolean;
	favoriteOverlays: Overlay[];
	layout: LayoutKey;
	flags: Map<statusBarFlagsItemsEnum, boolean> = new Map<statusBarFlagsItemsEnum, boolean>();
	time: CaseTimeState;

	dataInputFilters: CaseDataInputFiltersState;
	dataInputFiltersTitle: CaseDataFilterTitle = CaseDataFilterTitle.Disabled;
	private subscriptions = [];

	get toolTips(): IToolTipsConfig {
		return this.statusBarConfig.toolTips || {};
	}

	get statusBarFlagsItemsEnum() {
		return statusBarFlagsItemsEnum;
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

			this.flags$.subscribe((flags: Map<statusBarFlagsItemsEnum, boolean>) => {
				this.flags = new Map(flags);
			}),

			this.dataInputFilters$.subscribe()
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
		this.store.dispatch(new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.geoFilterSearch }));
	}

	toggleIndicatorView() {
		this.store.dispatch(new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.geoFilterIndicator }));
	}

	comboBoxesChange(payload: ComboBoxesProperties) {
		this.store.dispatch(new SetComboBoxesProperties(payload));
		if (payload.geoFilter) {
			this.store.dispatch(new UpdateStatusFlagsAction({
				key: statusBarFlagsItemsEnum.geoFilterSearch,
				value: true
			}));
		}
	}

	ngOnDestroy() {
		this.subscriptions.forEach((sub) => sub.unsubscribe());
	}
}
