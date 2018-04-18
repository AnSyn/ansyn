import { Component, HostListener, Inject, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { IStatusBarState, statusBarStateSelector } from '../../reducers/status-bar.reducer';
import { CopySelectedCaseLinkAction, ExpandAction, UpdateStatusFlagsAction } from '../../actions/status-bar.actions';
import { Observable } from 'rxjs/Observable';
import {
	BackToWorldView, CaseGeoFilter, CaseMapState, CaseOrientation, CaseTimeFilter, CaseTimeState,
	CoreActionTypes, coreStateSelector, GoAdjacentOverlay, ICoreState, LayoutKey,
	layoutOptions, Overlay, OverlaysCriteria, SetLayoutAction, SetOverlaysCriteriaAction, UpdateOverlaysCountAction
} from '@ansyn/core';
import { IStatusBarConfig, IToolTipsConfig, StatusBarConfig, ComboBoxesProperties, statusBarFlagsItemsEnum } from '../../models';
import { SetComboBoxesProperties } from '../../actions';
import { GEO_FILTERS, ORIENTATIONS, TIME_FILTERS } from '../../models/combo-boxes.model';
import { UpdateSearchModeAction } from "../../actions/status-bar.actions";
import { Actions } from '@ngrx/effects';

@Component({
	selector: 'ansyn-status-bar',
	templateUrl: './status-bar.component.html',
	styleUrls: ['./status-bar.component.less']
})

export class StatusBarComponent implements OnInit {


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

	overlaysCount$: Observable<number> = this.actions$
		.ofType(CoreActionTypes.UPDATE_OVERLAY_COUNT)
		.map(({ payload }: UpdateOverlaysCountAction) => payload);

	favoriteOverlays: Overlay[];
	layout: LayoutKey;
	flags: Map<statusBarFlagsItemsEnum, boolean> = new Map<statusBarFlagsItemsEnum, boolean>();
	time: CaseTimeState;
	timeSelectionEditIcon = false;
	@Input() selectedCaseName: string;
	@Input() activeMap: CaseMapState;
	goPrevActive = false;
	goNextActive = false;
	searchType: CaseGeoFilter = 'Pin-Point';

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

		this.comboBoxesProperties$.subscribe((comboBoxesProperties) => this.comboBoxesProperties = comboBoxesProperties);

		this.store.dispatch(new UpdateStatusFlagsAction({
			key: statusBarFlagsItemsEnum.geoFilterIndicator,
			value: true
		}));
	}

	setSubscribers() {
		this.layout$.subscribe((layout: LayoutKey) => this.layout = layout);

		this.comboBoxesProperties$.subscribe((comboBoxesProperties) => {
			this.comboBoxesProperties = comboBoxesProperties
		});

		this.flags$.subscribe((flags: Map<statusBarFlagsItemsEnum, boolean>) => {
			this.flags = new Map(flags);
		});

		this.time$.subscribe(_time => {
			this.time = _time;
		});


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
		if (payload.geoFilter !== undefined)
		{
			this.searchType = payload.geoFilter;
			this.store.dispatch((new UpdateSearchModeAction(this.searchType)));
		}
		this.store.dispatch(new SetComboBoxesProperties(payload));
		this.toggleMapSearch();
	}

	copyLink(): void {
		this.store.dispatch(new CopySelectedCaseLinkAction());
	}

	toggleMapSearch() {
		// this.store.dispatch(new ClearActiveInteractionsAction({ skipClearFor: [UpdateStatusFlagsAction] }));
		this.store.dispatch(new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.geoFilterIndicator, value: true }));

		if (this.comboBoxesProperties.geoFilter === 'Polygon') {
			this.store.dispatch(new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.pinPointSearch, value: false }));
			this.store.dispatch(new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.polygonSearch }));
		} else if (this.comboBoxesProperties.geoFilter === 'Pin-Point') {
			this.store.dispatch(new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.polygonSearch, value: false }));
			this.store.dispatch(new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.pinPointSearch }));

		}
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
}
