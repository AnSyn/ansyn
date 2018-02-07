import { Component, HostListener, Inject, Input, OnInit, Renderer2 } from '@angular/core';
import { Store } from '@ngrx/store';
import { IStatusBarState, statusBarStateSelector } from '../../reducers/status-bar.reducer';
import {
	BackToWorldViewAction, ChangeLayoutAction, CopySelectedCaseLinkAction, ExpandAction, GoNextAction,
	GoPrevAction, SetTimeAction, UpdateStatusFlagsAction
} from '../../actions/status-bar.actions';
import { Observable } from 'rxjs/Observable';
import {
	CaseGeoFilter, CaseMapState, CaseOrientation, CaseTimeFilter, ClearActiveInteractionsAction, coreStateSelector,
	ICoreState,
	Overlay
} from '@ansyn/core';
import { IStatusBarConfig, IToolTipsConfig, StatusBarConfig } from '../../models';
import { SetComboBoxesProperties } from '../../actions';
import {
	comboBoxesOptions, ComboBoxesProperties, StatusBarFlag,
	statusBarFlagsItems
} from '@ansyn/status-bar/models';
import { layoutOptions } from '../../models/layout-options.model';

@Component({
	selector: 'ansyn-status-bar',
	templateUrl: './status-bar.component.html',
	styleUrls: ['./status-bar.component.less']
})

export class StatusBarComponent implements OnInit {
	layouts = layoutOptions;
	statusBar$: Observable<IStatusBarState> = this.store.select(statusBarStateSelector);
	core$: Observable<ICoreState> = this.store.select(coreStateSelector);
	selectedLayoutIndex$: Observable<number> = this.statusBar$.pluck<IStatusBarState, number>('selectedLayoutIndex').distinctUntilChanged();
	comboBoxesProperties$: Observable<ComboBoxesProperties> = this.statusBar$.pluck<IStatusBarState, ComboBoxesProperties>('comboBoxesProperties').distinctUntilChanged();
	comboBoxesProperties: ComboBoxesProperties = {};
	flags$ = this.statusBar$.pluck('flags').distinctUntilChanged();
	time$: Observable<{ from: Date, to: Date }> = this.statusBar$.pluck<IStatusBarState, { from: Date, to: Date }>('time').distinctUntilChanged();
	overlaysCount$: Observable<number> = this.statusBar$.pluck<IStatusBarState, number>('overlaysCount').distinctUntilChanged();
	overlayNotInCase$: Observable<boolean> = this.statusBar$.pluck<IStatusBarState, boolean>('overlayNotInCase').distinctUntilChanged();
	favoriteOverlays$: Observable<Overlay[]> = this.core$.pluck<ICoreState, Overlay[]>('favoriteOverlays');
	favoriteOverlays: Overlay[];
	selectedLayoutIndex: number;
	flags: Map<StatusBarFlag, boolean> = new Map<StatusBarFlag, boolean>();
	time: { from: Date, to: Date };
	hideOverlay: boolean;
	timeSelectionEditIcon = false;
	overlaysCount: number;
	overlayNotInCase: boolean;
	@Input() selectedCaseName: string;
	@Input() activeMap: CaseMapState;
	goPrevActive = false;
	goNextActive = false;

	get statusBarFlagsItems() {
		return statusBarFlagsItems;
	}
	get selectedOrientationIndex(): number {
		return comboBoxesOptions.orientations.indexOf(this.comboBoxesProperties.orientation);
	}
	get selectedGeoFilterIndex(): number {
		return comboBoxesOptions.geoFilters.indexOf(this.comboBoxesProperties.geoFilter);
	}
	get selectedTimeFilterIndex(): number {
		return comboBoxesOptions.timeFilters.indexOf(this.comboBoxesProperties.timeFilter);
	}
	get toolTips(): IToolTipsConfig {
		return this.statusBarConfig.toolTips || {};
	}
	get geoFilters(): CaseGeoFilter[] {
		return comboBoxesOptions.geoFilters;
	}
	get timeFilters(): CaseTimeFilter[] {
		return comboBoxesOptions.timeFilters;
	}
	get orientations(): CaseOrientation[] {
		return comboBoxesOptions.orientations;
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
			this.clickGoNext();
			this.goNextActive = false;
		} else if ($event.which === 37) { // ArrowLeft
			this.clickGoPrev();
			this.goPrevActive = false;
		}
	}

	constructor(@Inject(StatusBarConfig) public statusBarConfig: IStatusBarConfig, public store: Store<IStatusBarState>, public renderer: Renderer2) {

	}

	ngOnInit(): void {

		this.setSubscribers();

		this.store.dispatch(new UpdateStatusFlagsAction({
			key: statusBarFlagsItems.pinPointIndicator,
			value: true
		}));
	}

	setSubscribers() {
		this.selectedLayoutIndex$.subscribe((_selectedLayoutIndex: number) => {
			this.selectedLayoutIndex = _selectedLayoutIndex;
			this.hideOverlay = this.layouts[this.selectedLayoutIndex].mapsCount > 1;
		});

		this.comboBoxesProperties$.subscribe((comboBoxesProperties) => this.comboBoxesProperties = comboBoxesProperties);

		this.flags$.subscribe((flags: Map<StatusBarFlag, boolean>) => {
			this.flags = new Map(flags);
		});

		this.time$.subscribe(_time => {
			this.time = _time;
		});

		this.overlaysCount$.subscribe(overlaysCount => {
			this.overlaysCount = overlaysCount;
		});

		this.overlayNotInCase$.subscribe(_overlayNotInCase => {
			this.overlayNotInCase = _overlayNotInCase;
		});

		this.favoriteOverlays$.subscribe((favoriteOverlays) => {
			this.favoriteOverlays = favoriteOverlays;
		});
	}

	isFavoriteOverlayDisplayed() {
		return this.activeMap.data.overlay && this.favoriteOverlays.some(o => o.id === this.activeMap.data.overlay.id);
	}

	showGeoRegistrationError(): boolean {
		const key = statusBarFlagsItems.geoRegisteredOptionsEnabled;
		return this.flags.has(key) && !this.flags.get(key);
	}

	toggleTimelineStartEndSearch() {
		this.timeSelectionEditIcon = !this.timeSelectionEditIcon;
	}

	applyTimelinePickerResult(result) {
		this.store.dispatch(new SetTimeAction({ from: result.start, to: result.end }));
		this.toggleTimelineStartEndSearch();
	}

	layoutRender(layoutIndex) {
		return `<i class="icon-screen-${layoutIndex + 1}" ></i>`;
	}

	layoutSelectChange(selectedLayoutIndex: number): void {
		this.store.dispatch(new ChangeLayoutAction(selectedLayoutIndex));
	}

	comboBoxesChange(payload: ComboBoxesProperties) {
		this.store.dispatch(new SetComboBoxesProperties(payload));
	}

	copyLink(): void {
		this.store.dispatch(new CopySelectedCaseLinkAction());
	}

	toggleMapPointSearch() {
		this.store.dispatch(new ClearActiveInteractionsAction({ skipClearFor: [UpdateStatusFlagsAction] }));
		this.store.dispatch(new UpdateStatusFlagsAction({ key: statusBarFlagsItems.pinPointSearch }));
	}

	togglePinPointIndicatorView() {
		this.store.dispatch(new UpdateStatusFlagsAction({ key: statusBarFlagsItems.pinPointIndicator }));
	}

	clickGoPrev(): void {
		this.store.dispatch(new GoPrevAction());
	}

	clickGoNext(): void {
		this.store.dispatch(new GoNextAction());
	}

	clickExpand(): void {
		this.store.dispatch(new ExpandAction());
	}

	clickTime(): void {
	}

	clickBackToWorldView(): void {
		this.store.dispatch(new BackToWorldViewAction());
	}
}
