import { Component, HostListener, Inject, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { IStatusBarState, statusBarStateSelector } from '../../reducers/status-bar.reducer';
import {
	CopySelectedCaseLinkAction,
	ExpandAction,
	SetComboBoxesProperties,
	UpdateStatusFlagsAction
} from '../../actions/status-bar.actions';
import { Observable } from 'rxjs/Observable';

import {
	ComboBoxesProperties,
	DATA_INPUT_FILTERS,
	GEO_FILTERS,
	ORIENTATIONS,
	TIME_FILTERS
} from '../../models/combo-boxes.model';
import { Actions } from '@ngrx/effects';
import { Overlay, OverlaysCriteria } from '@ansyn/core/models/overlay.model';
import { coreStateSelector, ICoreState } from '@ansyn/core/reducers/core.reducer';
import { LayoutKey, layoutOptions } from '@ansyn/core/models/layout-options.model';
import {
	Case,
	CaseDataInputFilter,
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
import { casesStateSelector, ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';

@Component({
	selector: 'ansyn-status-bar',
	templateUrl: './status-bar.component.html',
	styleUrls: ['./status-bar.component.less']
})

export class StatusBarComponent implements OnInit {


	selectedCase$: Observable<Case> = this.store.select(casesStateSelector)
		.pluck<ICasesState, Case>('selectedCase')
		.filter(selectedCase => Boolean(selectedCase))
		.distinctUntilChanged();

	overlaysCriteria$: Observable<OverlaysCriteria> = this.store.select(coreStateSelector)
		.pluck<ICoreState, OverlaysCriteria>('overlaysCriteria')
		.distinctUntilChanged();

	preFilter$: Observable<any> = Observable.combineLatest(this.overlaysCriteria$.pluck<OverlaysCriteria, CaseDataInputFiltersState>('dataInputFilters'), this.selectedCase$)
		.do(([caseDataInputFilter, selectedCase]: [CaseDataInputFiltersState, Case]) => {
			if (!Boolean(caseDataInputFilter)) {
				this.dataInputSelectedName = selectedCase.id === this.casesService.defaultCase.id ? 'All' : 'ERROR';
			} else {
				this.dataInputSelectedName = caseDataInputFilter.dataInputFiltersTitle;
			}
		});


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
	dataInputFilterIcon = false;
	@Input() selectedCaseName: string;
	@Input() activeMap: CaseMapState;
	goPrevActive = false;
	goNextActive = false;
	dataInputSelectedName: string;
	_preFilters: any;

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
				@Inject(DATA_INPUT_FILTERS) public dataInputFilters: CaseDataInputFilter[],
				@Inject(TIME_FILTERS) public timeFilters: CaseTimeFilter[],
				@Inject(GEO_FILTERS) public geoFilters: CaseGeoFilter[],
				protected actions$: Actions,
				protected casesService: CasesService) {
	}

	ngOnInit(): void {
		this.setSubscribers();
		this.preFilter$.subscribe();
		this.comboBoxesProperties$.subscribe((comboBoxesProperties) => {
			this.comboBoxesProperties = comboBoxesProperties;
			// this.changeDataInputSelectName();
		});

		this.store.dispatch(new UpdateStatusFlagsAction({
			key: statusBarFlagsItemsEnum.geoFilterIndicator,
			value: true
		}));
	}


	setSubscribers() {
		this.layout$.subscribe((layout: LayoutKey) => this.layout = layout);

		this.comboBoxesProperties$.subscribe((comboBoxesProperties) => {
			this.comboBoxesProperties = comboBoxesProperties;
		});

		this.flags$.subscribe((flags: Map<statusBarFlagsItemsEnum, boolean>) => {
			this.flags = new Map(flags);
		});

		this.time$.subscribe(_time => {
			this.time = _time;
		});

		this.selectedCase$.subscribe();
	}

	toggleDataInputFilterIcon() {
		this.dataInputFilterIcon = !this.dataInputFilterIcon;
		// if (this.dataInputFilterIcon) {
		// 	this._oldSelectedFilters = this._selectedFilters;
		// }
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

	onFiltersChanged(name: string): void {
		if (this.dataInputSelectedName !== name) {
			this.dataInputSelectedName = name;
		}
	}
}
