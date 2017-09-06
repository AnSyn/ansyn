import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { IStatusBarState, statusBarFlagsItems } from '../../reducers/status-bar.reducer';
import {
	ChangeLayoutAction, SetLinkCopyToastValueAction, OpenShareLink, UpdateStatusFlagsAction,
	CopySelectedCaseLinkAction, FavoriteAction, ExpandAction, GoNextAction, GoPrevAction, BackToWorldViewAction,
	SetOrientationAction, SetGeoFilterAction, SetTimeAction
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

	layouts$: Observable<MapsLayout[]> = this.status_bar$.pluck('layouts').distinctUntilChanged();
	selected_layout_index$: Observable<number> = this.status_bar$.pluck('selected_layout_index').distinctUntilChanged();
	showLinkCopyToast$: Observable<boolean> = this.status_bar$.pluck('showLinkCopyToast').distinctUntilChanged();
	orientations$: Observable<string[]> = this.status_bar$.pluck('orientations').distinctUntilChanged();
	orientation$: Observable<string> = this.status_bar$.pluck('orientation').distinctUntilChanged();
	geoFilters$: Observable<string[]> = this.status_bar$.pluck('geoFilters').distinctUntilChanged();
	geoFilter$: Observable<string> = this.status_bar$.pluck('geoFilter').distinctUntilChanged();
	flags$ = this.status_bar$.pluck('flags').distinctUntilChanged();
	time$: Observable<{from: Date, to: Date}> = this.status_bar$.pluck('time').distinctUntilChanged();
	hideOverlay$: Observable<boolean> = this.status_bar$
		.map((state: IStatusBarState) => state.layouts[state.selected_layout_index].maps_count > 1)
		.distinctUntilChanged();
	overlays_count$: Observable<number> = this.status_bar$.pluck('overlays_count').distinctUntilChanged();
	notFromCaseOverlay$: Observable<boolean> = this.status_bar$.pluck('notFromCaseOverlay').distinctUntilChanged();

	layouts: MapsLayout[] = [];
	selected_layout_index: number;
	showLinkCopyToast: boolean;
	orientations: string[] = [];
	orientation: string;
	geoFilters: string[] = [];
	geoFilter: string;
	flags: Map<string, boolean> = new Map<string, boolean>();
	time: {from: Date, to: Date};
	hideOverlay: boolean;
	statusBarFlagsItems: any = statusBarFlagsItems;
	timeSelectionEditIcon = false;
	overlays_count: number;
	notFromCaseOverlay: boolean;

	@Input() selected_case_name: string;
	@Input() overlay: any;

	@Input()
	set isFavoriteOverlayDisplayed(value){
		if(value){
			this.renderer.setStyle(this.starColor.nativeElement,'fill','gold');
		}else{
			this.renderer.setStyle(this.starColor.nativeElement,'fill','initial');
		}
	}

	@Output('toggleEditMode') toggleEditMode = new EventEmitter();
	@ViewChild('goPrev') goPrev: ElementRef;
	@ViewChild('goNext') goNext: ElementRef;
	@ViewChild('starColor') starColor: ElementRef;

	@HostListener("window:keydown", ['$event'])
	onkeydown($event: KeyboardEvent) {
		if ((<Window>$event.currentTarget).document.activeElement instanceof HTMLInputElement) {
			return;
		}

		if ($event.code === "ArrowRight") {
			this.goNext.nativeElement.classList.add('active');
		}
		else if ($event.code === "ArrowLeft") {
			this.goPrev.nativeElement.classList.add('active');
		}
	}

	@HostListener("window:keyup", ['$event'])
	onkeyup($event: KeyboardEvent) {
		if ((<Window>$event.currentTarget).document.activeElement instanceof HTMLInputElement) {
			return;
		}

		if ($event.code === "ArrowRight") {
			this.clickGoNext();
			this.goNext.nativeElement.classList.remove('active');
		}
		else if ($event.code === "ArrowLeft") {
			this.clickGoPrev();
			this.goPrev.nativeElement.classList.remove('active');
		}
	}

	constructor(public store: Store<IStatusBarState>,public renderer: Renderer2) {}

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

		this.showLinkCopyToast$.subscribe((_showLinkCopyToast) => {
			this.showLinkCopyToast = _showLinkCopyToast;
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

		this.orientation$.subscribe((_orientation)=>{
			this.orientation = _orientation;
		});

		this.geoFilter$.subscribe((_geoFilter)=>{
			this.geoFilter = _geoFilter;
		});

		this.flags$.subscribe((flags: Map<string, boolean>) => {
			//I want to check that the one that was changing is the pin point search
			if (this.flags.get(statusBarFlagsItems.pinPointSearch) !== flags.get(statusBarFlagsItems.pinPointSearch)) {
				this.toggleEditMode.emit();
			}
			this.flags = new Map(flags) as Map<string, boolean>;
		});

		this.time$.subscribe(_time => {
			this.time = _time;
		});

		this.hideOverlay$.subscribe((_hideOverlay: boolean) => {
			this.hideOverlay = _hideOverlay;
		});

		this.overlays_count$.subscribe(_overlay_count => {
			this.overlays_count = _overlay_count
		});

		this.notFromCaseOverlay$.subscribe(_notFromCaseOverlay => {
			this.notFromCaseOverlay = _notFromCaseOverlay;
		})
	}

	showGeoRegistrationError(): boolean {
		const key = statusBarFlagsItems.geo_registered_options_enabled;
		return this.flags.has(key) && !this.flags.get(key)
	}

	toggleTimelineStartEndSearch() {
		this.timeSelectionEditIcon = !this.timeSelectionEditIcon;
	}

	applyTimelinePickerResult(result){
		//apply here your dispathces
		this.store.dispatch(new SetTimeAction({from: result.start, to: result.end}));
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
		this.store.dispatch(new SetLinkCopyToastValueAction(value));
	}

	copyLink(): void {
		this.store.dispatch(new CopySelectedCaseLinkAction());
	}

	openLink(): void {
		this.store.dispatch(new OpenShareLink());
	}

	toggleMapPointSearch() {
		this.store.dispatch(new UpdateStatusFlagsAction({key: statusBarFlagsItems.pinPointSearch}));
	}

	togglePinPointIndicatorView() {
		this.store.dispatch(new UpdateStatusFlagsAction({key: statusBarFlagsItems.pinPointIndicator}));
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

	clickFavorite(): void {
		this.store.dispatch(new FavoriteAction());
	}

	clickBackToWorldView(): void {
		this.store.dispatch(new BackToWorldViewAction());
	}
}
