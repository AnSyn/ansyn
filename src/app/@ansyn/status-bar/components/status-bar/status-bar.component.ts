import { Component, HostListener, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { IStatusBarState, statusBarStateSelector } from '../../reducers/status-bar.reducer';
import {
	CopySelectedCaseLinkAction,
	ExpandAction,
	SetComboBoxesProperties,
	UpdateStatusFlagsAction
} from '../../actions/status-bar.actions';
import { Observable } from 'rxjs/Observable';

import { ComboBoxesProperties, GEO_FILTERS, ORIENTATIONS, TIME_FILTERS } from '../../models/combo-boxes.model';
import { Actions } from '@ngrx/effects';
import { Overlay, OverlaysCriteria } from '@ansyn/core/models/overlay.model';
import { coreStateSelector, ICoreState } from '@ansyn/core/reducers/core.reducer';
import { LayoutKey, layoutOptions } from '@ansyn/core/models/layout-options.model';
import {
	CaseDataFilterTitle,
	CaseDataInputFiltersState,
	CaseGeoFilter,
	CaseMapState,
	CaseOrientation,
	CaseTimeFilter,
	CaseTimeState
} from '@ansyn/core/models/case.model';
import {
	BackToWorldView,
	CoreActionTypes,
	GoAdjacentOverlay,
	SetLayoutAction,
	SetOverlaysCriteriaAction,
	UpdateOverlaysCountAction
} from '@ansyn/core/actions/core.actions';
import { statusBarFlagsItemsEnum } from '@ansyn/status-bar/models/status-bar-flag-items.model';
import { IStatusBarConfig, IToolTipsConfig } from '@ansyn/status-bar/models/statusBar-config.model';
import { StatusBarConfig } from '@ansyn/status-bar/models/statusBar.config';

@Component({
	selector: 'ansyn-status-bar',
	templateUrl: './status-bar.component.html',
	styleUrls: ['./status-bar.component.less']
})

export class StatusBarComponent implements OnInit, OnDestroy {

	overlaysCriteria$: Observable<OverlaysCriteria> = this.store.select(coreStateSelector)
		.pluck<ICoreState, OverlaysCriteria>('overlaysCriteria')
		.distinctUntilChanged();

	layout$: Observable<LayoutKey> = this.store.select(coreStateSelector)
		.pluck<ICoreState, LayoutKey>('layout')
		.distinctUntilChanged();

	comboBoxesProperties$: Observable<ComboBoxesProperties> = this.store.select(statusBarStateSelector)
		.pluck<IStatusBarState, ComboBoxesProperties>('comboBoxesProperties')
		.distinctUntilChanged();

	comboBoxesProperties: ComboBoxesProperties = {};

	flags$ = this.store.select(statusBarStateSelector).pluck('flags').distinctUntilChanged();

	time$: Observable<CaseTimeState> = this.overlaysCriteria$
		.pluck<OverlaysCriteria, CaseTimeState>('time')
		.distinctUntilChanged();

	dataInputFilters$ = this.overlaysCriteria$
		.pluck<OverlaysCriteria, CaseDataInputFiltersState>('dataInputFilters')
		.distinctUntilChanged()
		.filter((caseDataInputFiltersState: CaseDataInputFiltersState) => Boolean(caseDataInputFiltersState))
		.do((caseDataInputFiltersState: CaseDataInputFiltersState) => {
			const isFull = this.statusBarConfig.dataInputFiltersConfig.filters.every((filterConfig) => {
				return filterConfig.children.every((sensorTypeAndName) => {
					return caseDataInputFiltersState.filters.some((dataInputFilter) => {
						return dataInputFilter.sensorName === sensorTypeAndName.value.sensorName &&
							dataInputFilter.sensorType === sensorTypeAndName.value.sensorType;
					});
				});
			});
			this.dataInputFiltersTitle = isFull ? CaseDataFilterTitle.Full : CaseDataFilterTitle.Partial;
			this.dataInputFilters = caseDataInputFiltersState;
		});

	overlaysCount$: Observable<number> = this.actions$
		.ofType(CoreActionTypes.UPDATE_OVERLAY_COUNT)
		.map(({ payload }: UpdateOverlaysCountAction) => payload);

	favoriteOverlays: Overlay[];
	layout: LayoutKey;
	flags: Map<statusBarFlagsItemsEnum, boolean> = new Map<statusBarFlagsItemsEnum, boolean>();
	time: CaseTimeState;
	timeSelectionEditIcon = false;
	dataInputFilterIcon = false;
	@Input() selectedCaseName: string;
	@Input() activeMap: CaseMapState;
	goPrevActive = false;
	goNextActive = false;
	dataInputFilters: CaseDataInputFiltersState;
	dataInputFiltersTitle: CaseDataFilterTitle;

	private subscribers = [];

	get statusBarFlagsItemsEnum() {
		return statusBarFlagsItemsEnum;
	}

	get toolTips(): IToolTipsConfig {
		return this.statusBarConfig.toolTips || {};
	}

	get layouts(): LayoutKey[] {
		return Array.from(layoutOptions.keys());
	}

	get hideOverlay(): boolean {
		return layoutOptions.get(this.layout).mapsCount > 1;
	}

	@HostListener('window:keydown', ['$event'])
	onkeydown($event: KeyboardEvent) {
		if ((<Window>$event.currentTarget).document.activeElement instanceof HTMLInputElement) {
			return;
		}

		if ($event.which === 39) { // ArrowRight
			this.goNextActive = true;
		} else if ($event.which === 37) { // ArrowLeft
			this.goPrevActive = true;
		}
	}

	@HostListener('window:keyup', ['$event'])
	onkeyup($event: KeyboardEvent) {
		if ((<Window>$event.currentTarget).document.activeElement instanceof HTMLInputElement) {
			return;
		}

		if ($event.which === 39) { // ArrowRight
			this.clickGoAdjacent(true);
			this.goNextActive = false;
		} else if ($event.which === 37) { // ArrowLeft
			this.clickGoAdjacent(false);
			this.goPrevActive = false;
		}
	}

	constructor(@Inject(StatusBarConfig) public statusBarConfig: IStatusBarConfig,
				public store: Store<IStatusBarState>,
				@Inject(ORIENTATIONS) public orientations: CaseOrientation[],
				@Inject(TIME_FILTERS) public timeFilters: CaseTimeFilter[],
				@Inject(GEO_FILTERS) public geoFilters: CaseGeoFilter[],
				protected actions$: Actions) {
	}

	ngOnInit(): void {
		this.setSubscribers();

		this.store.dispatch(new UpdateStatusFlagsAction({
			key: statusBarFlagsItemsEnum.geoFilterIndicator,
			value: true
		}));
	}

	ngOnDestroy(): void {
		this.subscribers.forEach(sub => sub.unsubscribe());
	}

	setSubscribers() {
		this.subscribers.push(
			this.layout$.subscribe((layout: LayoutKey) => this.layout = layout),

			this.comboBoxesProperties$.subscribe((comboBoxesProperties) => {
				this.comboBoxesProperties = comboBoxesProperties;
			}),

			this.flags$.subscribe((flags: Map<statusBarFlagsItemsEnum, boolean>) => {
				this.flags = new Map(flags);
			}),

			this.time$.subscribe(_time => {
				this.time = _time;
			}),

			this.comboBoxesProperties$.subscribe((comboBoxesProperties) => {
				this.comboBoxesProperties = comboBoxesProperties;
			}),

			this.dataInputFilters$.subscribe()
		);

	}

	toggleDataInputFilterIcon() {
		this.dataInputFilterIcon = !this.dataInputFilterIcon;
	}

	toggleTimelineStartEndSearch() {
		this.timeSelectionEditIcon = !this.timeSelectionEditIcon;
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

	comboBoxesChange(payload: ComboBoxesProperties) {
		this.store.dispatch(new SetComboBoxesProperties(payload));
		if (payload.geoFilter) {
			this.store.dispatch(new UpdateStatusFlagsAction({
				key: statusBarFlagsItemsEnum.geoFilterSearch,
				value: true
			}));
		}
	}

	copyLink(): void {
		this.store.dispatch(new CopySelectedCaseLinkAction());
	}

	toggleMapSearch() {
		this.store.dispatch(new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.geoFilterSearch }));
	}

	toggleIndicatorView() {
		this.store.dispatch(new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.geoFilterIndicator }));
	}

	clickGoAdjacent(isNext): void {
		this.store.dispatch(new GoAdjacentOverlay({ isNext }));
	}

	clickExpand(): void {
		this.store.dispatch(new ExpandAction());
	}

	clickTime(): void {
	}

	clickBackToWorldView(): void {
		this.store.dispatch(new BackToWorldView({ mapId: this.activeMap.id }));
	}

	onCloseTreeView(): void {
		this.toggleDataInputFilterIcon();
	}

	onFiltersChanged(name: CaseDataFilterTitle): void {
		if (this.dataInputFiltersTitle !== name) {
			this.dataInputFiltersTitle = name;
		}
	}
}
