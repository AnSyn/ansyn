import { Component, ElementRef, HostListener, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { IStatusBarState, statusBarFlagsItems, IToastMessage } from '../../reducers/status-bar.reducer';
import {
	BackToWorldViewAction,
	ChangeLayoutAction,
	CopySelectedCaseLinkAction,
	ExpandAction,
	FavoriteAction,
	GoNextAction,
	GoPrevAction,
	OpenShareLink,
	SetGeoFilterAction,
	SetToastMessageStoreAction,
	SetOrientationAction,
	SetTimeAction,
	UpdateStatusFlagsAction
} from '../../actions/status-bar.actions';
import { Observable } from 'rxjs/Observable';
import { MapsLayout } from '@ansyn/core';

@Component({
	selector: 'ansyn-status-bar',
	templateUrl: './status-bar.component.html',
	styleUrls: ['./status-bar.component.less']
})
export class StatusBarComponent implements OnInit {

	status_bar$: Observable<IStatusBarState> = this.store.select('status_bar');

	layouts$: Observable<MapsLayout[]> = this.status_bar$.pluck<IStatusBarState, MapsLayout[]>('layouts').distinctUntilChanged();

	selected_layout_index$: Observable<number> = this.status_bar$.pluck<IStatusBarState, number>('selected_layout_index').distinctUntilChanged();

	orientations$: Observable<string[]> = this.status_bar$.pluck<IStatusBarState, string[]>('orientations').distinctUntilChanged();
	orientation$: Observable<string> = this.status_bar$.pluck<IStatusBarState, string>('orientation').distinctUntilChanged();
	geoFilters$: Observable<string[]> = this.status_bar$.pluck<IStatusBarState, string[]>('geoFilters').distinctUntilChanged();
	geoFilter$: Observable<string> = this.status_bar$.pluck<IStatusBarState, string>('geoFilter').distinctUntilChanged();

	flags$ = this.status_bar$.pluck('flags').distinctUntilChanged();
	toastMessage$ = this.status_bar$.pluck('toastMessage').distinctUntilChanged();
	time$: Observable<{ from: Date, to: Date }> = this.status_bar$.pluck<IStatusBarState, { from: Date, to: Date }>('time').distinctUntilChanged();
	hideOverlay$: Observable<boolean> = this.status_bar$
		.map((state: IStatusBarState) => state.layouts[state.selected_layout_index].maps_count > 1)
		.distinctUntilChanged();
	overlays_count$: Observable<number> = this.status_bar$.pluck<IStatusBarState, number>('overlays_count').distinctUntilChanged();
	overlayNotInCase$: Observable<boolean> = this.status_bar$.pluck<IStatusBarState, boolean>('overlayNotInCase').distinctUntilChanged();

	layouts: MapsLayout[] = [];
	selected_layout_index: number;
	showToast: boolean;
	showAlertIcon: boolean;
	toastText: string;
	orientations: string[] = [];
	orientation: string;
	geoFilters: string[] = [];
	geoFilter: string;
	flags: Map<string, boolean> = new Map<string, boolean>();
	time: { from: Date, to: Date };
	hideOverlay: boolean;
	statusBarFlagsItems: any = statusBarFlagsItems;
	timeSelectionEditIcon = false;
	overlays_count: number;
	overlayNotInCase: boolean;

	@Input() selected_case_name: string;
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
			this.goNext.nativeElement.classList.add('active');
		}
		else if ($event.code === 'ArrowLeft') {
			this.goPrev.nativeElement.classList.add('active');
		}
	}

	@HostListener('window:keyup', ['$event'])
	onkeyup($event: KeyboardEvent) {
		if ((<Window>$event.currentTarget).document.activeElement instanceof HTMLInputElement) {
			return;
		}

		if ($event.code === 'ArrowRight') {
			this.clickGoNext();
			this.goNext.nativeElement.classList.remove('active');
		}
		else if ($event.code === 'ArrowLeft') {
			this.clickGoPrev();
			this.goPrev.nativeElement.classList.remove('active');
		}
	}

	constructor(public store: Store<IStatusBarState>, public renderer: Renderer2) {
		this.showToast = false;
		this.toastText = '';
		this.showAlertIcon = false;
	}

	ngOnInit(): void {

		this.setSubscribers();

		this.store.dispatch(new UpdateStatusFlagsAction({
			key: statusBarFlagsItems.pinPointIndicator,
			value: true
		}));
	}

	setSubscribers() {
		this.selected_layout_index$.subscribe((_selected_layout_index: number) => {
			this.selected_layout_index = _selected_layout_index;
		});

		this.layouts$.subscribe((_layouts: MapsLayout[]) => {
			this.layouts = _layouts;
		});

		this.toastMessage$.subscribe((_toastFlags: IToastMessage) => {
			if (!_toastFlags) {
				this.showToast = false;
				this.showAlertIcon = false;
				this.toastText = '';
			} else {
				this.toastText = _toastFlags.toastText;
				this.showAlertIcon = _toastFlags.showWarningIcon;
				this.showToast = true;
			}
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

		this.overlays_count$.subscribe(_overlay_count => {
			this.overlays_count = _overlay_count;
		});

		this.overlayNotInCase$.subscribe(_overlayNotInCase => {
			this.overlayNotInCase = _overlayNotInCase;
		});
	}

	showGeoRegistrationError(): boolean {
		const key = statusBarFlagsItems.geo_registered_options_enabled;
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

	layoutSelectChange(selected_layout_index: number): void {
		this.store.dispatch(new ChangeLayoutAction(selected_layout_index));
	}

	orientationChange(_orientation) {
		this.store.dispatch(new SetOrientationAction(_orientation));
	}

	geoFilterChange(_geoFilter) {
		this.store.dispatch(new SetGeoFilterAction(_geoFilter));
	}

	onShowToastChange(value: boolean) {
		if (!value) {
			this.store.dispatch(new SetToastMessageStoreAction());
		}
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
		this.renderer.setStyle(this.starColor.nativeElement, 'fill', 'initial');
		this.store.dispatch(new GoPrevAction());
	}

	clickGoNext(): void {
		this.renderer.setStyle(this.starColor.nativeElement, 'fill', 'initial');
		this.store.dispatch(new GoNextAction());
	}

	clickExpand(): void {
		this.store.dispatch(new ExpandAction());
	}

	clickFavorite(): void {
		this.store.dispatch(new FavoriteAction());
	}

	clickBackToWorldView(): void {
		this.store.dispatch(new BackToWorldViewAction());
	}
}
