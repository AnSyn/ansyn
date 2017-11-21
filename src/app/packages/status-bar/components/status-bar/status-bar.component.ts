import { Component, ElementRef, HostListener, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
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
import { MapsLayout } from '@ansyn/core';
import { SetToastMessageAction, ToggleFavoriteAction } from '@ansyn/core/actions/core.actions';

@Component({
	selector: 'ansyn-status-bar',
	templateUrl: './status-bar.component.html',
	styleUrls: ['./status-bar.component.less']
})

export class StatusBarComponent implements OnInit {

	statusBar$: Observable<IStatusBarState> = this.store.select(statusBarStateSelector);

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

	layouts: MapsLayout[] = [];
	selectedLayoutIndex: number;

	orientations: string[] = [];
	orientation: string;
	geoFilters: string[] = [];
	geoFilter: string;
	flags: Map<string, boolean> = new Map<string, boolean>();
	time: { from: Date, to: Date };
	hideOverlay: boolean;
	statusBarFlagsItems: any = statusBarFlagsItems;
	timeSelectionEditIcon = false;
	overlaysCount: number;
	overlayNotInCase: boolean;

	@Input() selectedCaseName: string;
	@Input() overlay: any;
	@Input() isFavoriteOverlayDisplayed = false;

	@ViewChild('goPrev') goPrev: ElementRef;
	@ViewChild('goNext') goNext: ElementRef;

	@HostListener('window:keydown', ['$event'])
	onkeydown($event: KeyboardEvent) {
		if ((<Window>$event.currentTarget).document.activeElement instanceof HTMLInputElement) {
			return;
		}

		if ($event.code === 'ArrowRight') {
			this.renderer.addClass(this.goNext.nativeElement, 'active');
		}
		else if ($event.code === 'ArrowLeft') {
			this.renderer.addClass(this.goPrev.nativeElement, 'active');
		}
	}

	@HostListener('window:keyup', ['$event'])
	onkeyup($event: KeyboardEvent) {
		if ((<Window>$event.currentTarget).document.activeElement instanceof HTMLInputElement) {
			return;
		}

		if ($event.code === 'ArrowRight') {
			this.clickGoNext();
			this.renderer.removeClass(this.goNext.nativeElement, 'active');
		}
		else if ($event.code === 'ArrowLeft') {
			this.clickGoPrev();
			this.renderer.removeClass(this.goPrev.nativeElement, 'active');
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

	layoutSelectChange(selectedLayoutIndex: number): void {
		this.store.dispatch(new ChangeLayoutAction(selectedLayoutIndex));
	}

	orientationChange(_orientation) {
		this.store.dispatch(new SetOrientationAction(_orientation));
	}

	geoFilterChange(_geoFilter) {
		this.store.dispatch(new SetGeoFilterAction(_geoFilter));
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
		this.isFavoriteOverlayDisplayed = false;
		this.store.dispatch(new GoPrevAction());
	}

	clickGoNext(): void {
		this.isFavoriteOverlayDisplayed = false;
		this.store.dispatch(new GoNextAction());
	}

	clickExpand(): void {
		this.store.dispatch(new ExpandAction());
	}

	clickFavorite(): void {
		this.store.dispatch(new ToggleFavoriteAction(this.overlay.id));
	}

	clickBackToWorldView(): void {
		this.store.dispatch(new BackToWorldViewAction());
	}
}
