import { Component, HostListener, Input, OnInit, Renderer2 } from '@angular/core';
import { Store } from '@ngrx/store';
import { IStatusBarState, statusBarFlagsItems, statusBarStateSelector } from '../../reducers/status-bar.reducer';
import {
	BackToWorldViewAction,
	ChangeLayoutAction,
	CopySelectedCaseLinkAction,
	ExpandAction,
	GoNextAction,
	GoPrevAction,
	OpenShareLink,
	SetGeoFilterAction,
	SetOrientationAction,
	SetTimeAction,
	UpdateStatusFlagsAction
} from '../../actions/status-bar.actions';
import { Observable } from 'rxjs/Observable';
import { MapsLayout, coreStateSelector, ICoreState, Overlay } from '@ansyn/core'

@Component({
	selector: 'ansyn-status-bar',
	templateUrl: './status-bar.component.html',
	styleUrls: ['./status-bar.component.less']
})

export class StatusBarComponent implements OnInit {

	statusBar$: Observable<IStatusBarState> = this.store.select(statusBarStateSelector);
	core$: Observable<ICoreState> = this.store.select(coreStateSelector);
	layouts$: Observable<MapsLayout[]> = this.statusBar$.pluck<IStatusBarState, MapsLayout[]>('layouts').distinctUntilChanged();

	selectedLayoutIndex$: Observable<number> = this.statusBar$.pluck<IStatusBarState, number>('selectedLayoutIndex').distinctUntilChanged();

	orientations$: Observable<string[]> = this.statusBar$.pluck<IStatusBarState, string[]>('orientations').distinctUntilChanged();
	orientation$: Observable<string> = this.statusBar$.pluck<IStatusBarState, string>('orientation').distinctUntilChanged();
	geoFilters$: Observable<string[]> = this.statusBar$.pluck<IStatusBarState, string[]>('geoFilters').distinctUntilChanged();
	geoFilter$: Observable<string> = this.statusBar$.pluck<IStatusBarState, string>('geoFilter').distinctUntilChanged();

	flags$ = this.statusBar$.pluck('flags').distinctUntilChanged();
	time$: Observable<{ from: Date, to: Date }> = this.statusBar$.pluck<IStatusBarState, { from: Date, to: Date }>('time').distinctUntilChanged();
	hideOverlay$: Observable<boolean> = this.statusBar$
		.map((state: IStatusBarState) => state.layouts[state.selectedLayoutIndex] && state.layouts[state.selectedLayoutIndex].mapsCount > 1)
		.distinctUntilChanged();
	overlaysCount$: Observable<number> = this.statusBar$.pluck<IStatusBarState, number>('overlaysCount').distinctUntilChanged();
	overlayNotInCase$: Observable<boolean> = this.statusBar$.pluck<IStatusBarState, boolean>('overlayNotInCase').distinctUntilChanged();

	favoriteOverlays$: Observable<Overlay[]> = this.core$.pluck<ICoreState, Overlay[]>('favoriteOverlays');
	favoriteOverlays: Overlay[];

	layouts: MapsLayout[] = [];
	selectedLayoutIndex: number;

	orientations: string[] = [];
	orientation: string;
	get selectedOrientationIndex(): number {
		return this.orientations.indexOf(this.orientation);
	}
	_selectedOrientationIndex
	set selectedOrientationIndex(value) {
		this._selectedOrientationIndex = value

	}

	geoFilters: string[] = [];
	geoFilter: string;
	get selectedGeoFilterIndex(): number {
		return this.geoFilters.indexOf(this.geoFilter);
	}
	_selectedGeoFilterIndex
	set selectedGeoFilterIndex(value) {
		this._selectedGeoFilterIndex = value

	}

	timeLines: string[] = ['Start - End'];
	timeLine = 'Start - End';

	get selectedTimeLineIndex(): number {
		return this.timeLines.indexOf(this.timeLine);
	}
	_selectedTimeLineIndex
	set selectedTimeLineIndex(value) {
		this._selectedTimeLineIndex = value

	}


	flags: Map<string, boolean> = new Map<string, boolean>();
	time: { from: Date, to: Date };
	hideOverlay: boolean;
	statusBarFlagsItems: any = statusBarFlagsItems;
	timeSelectionEditIcon = false;
	overlaysCount: number;
	overlayNotInCase: boolean;
	@Input() selectedCaseName: string;
	@Input() overlay: any;

	goPrevActive = false;
	goNextActive = false;

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

	constructor(public store: Store<IStatusBarState>, public renderer: Renderer2) {
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
		});

		this.layouts$.subscribe((_layouts: MapsLayout[]) => {
			this.layouts = _layouts;
		});

		this.orientations$.subscribe((_orientations) => {
			this.orientations = _orientations;
		});

		this.geoFilters$.subscribe((_geoFilters) => {
			this.geoFilters = _geoFilters;
		});

		this.orientations$.subscribe((_orientations) => {
			this.orientations = _orientations;
		});

		this.orientation$.subscribe((_orientation) => {
			this.orientation = _orientation;
		});

		this.geoFilter$.subscribe((_geoFilter) => {
			this.geoFilter = _geoFilter;
		});

		this.flags$.subscribe((flags: Map<string, boolean>) => {
			this.flags = new Map(flags) as Map<string, boolean>;
		});

		this.time$.subscribe(_time => {
			this.time = _time;
		});

		this.hideOverlay$.subscribe((_hideOverlay: boolean) => {
			this.hideOverlay = _hideOverlay;
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
		return this.overlay && this.favoriteOverlays.some(o => o.id === this.overlay.id);
	}

	showGeoRegistrationError(): boolean {
		const key = statusBarFlagsItems.geoRegisteredOptionsEnabled;
		return this.flags.has(key) && !this.flags.get(key);
	}

	toggleTimelineStartEndSearch() {
		this.timeSelectionEditIcon = !this.timeSelectionEditIcon;
	}

	applyTimelinePickerResult(result) {
		// apply here your dispathces
		this.store.dispatch(new SetTimeAction({ from: result.start, to: result.end }));
		this.toggleTimelineStartEndSearch();
	}

	layoutRender(layoutIndex) {
		return `<i class="icon-screen-${layoutIndex + 1}" ></i>`
	}

	layoutSelectChange(selectedLayoutIndex: number): void {
		this.store.dispatch(new ChangeLayoutAction(selectedLayoutIndex));
	}

	orientationChange(orientationIndex) {
		this.store.dispatch(new SetOrientationAction(this.orientations[orientationIndex]));
	}

	geoFilterChange(geoFilterIndex) {
		this.store.dispatch(new SetGeoFilterAction(this.geoFilters[geoFilterIndex]));
	}

	copyLink(): void {
		this.store.dispatch(new CopySelectedCaseLinkAction());
	}

	openLink(): void {
		this.store.dispatch(new OpenShareLink());
	}

	toggleMapPointSearch() {
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
