import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { IStatusBarState, statusBarFlagsItems } from '../reducers/status-bar.reducer';
import {
	ChangeLayoutAction, SetLinkCopyToastValueAction, OpenShareLink, UpdateStatusFlagsAction,
	CopySelectedCaseLinkAction, FavoriteAction, ExpandAction, GoNextAction, GoPrevAction, BackToWorldViewAction,
	SetOrientationAction, SetGeoFilterAction, SetTimeAction
} from '../actions/status-bar.actions';
import { Observable } from 'rxjs/Observable';
import { isEqual } from 'lodash';
import { MapsLayout } from '@ansyn/core';
import { createSelector } from '@ansyn/core';
import { CaseTimeState } from '@ansyn/core/models/case.model';

@Component({
	selector: 'ansyn-status-bar',
	templateUrl: './status-bar.component.html',
	styleUrls: ['./status-bar.component.less']
})
export class StatusBarComponent implements OnInit {

	layouts$: Observable<MapsLayout[]> = createSelector(this.store, 'status_bar', 'layouts');
	selected_layout_index$: Observable<number> = createSelector(this.store, 'status_bar', 'selected_layout_index');
	showLinkCopyToast$: Observable<boolean> = createSelector(this.store, 'status_bar', 'showLinkCopyToast');
	orientations$: Observable<string[]> = createSelector(this.store, 'status_bar', 'orientations');
	orientation$: Observable<string> = createSelector(this.store, 'status_bar', 'orientation');
	geoFilters$: Observable<string[]> = createSelector(this.store, 'status_bar', 'geoFilters');
	geoFilter$: Observable<string> = createSelector(this.store, 'status_bar', 'geoFilter');
	flags$ = createSelector(this.store, 'status_bar', 'flags');
	time$ = createSelector(this.store, 'status_bar', 'time');


	layouts: MapsLayout[] = [];
	selected_layout_index: number;
	showLinkCopyToast: boolean;
	orientations: string[] = [];
	orientation: string;
	geoFilters: string[] = [];
	geoFilter: string;
	flags: Map<string, boolean> = new Map<string, boolean>();
	time: {from: Date, to: Date};

	statusBarFlagsItems: any = statusBarFlagsItems;
	timeSelectionEditIcon = false;

	@Input() selected_case_name: string;
	@Input() overlays_count: number;
	@Input('overlay') overlay: any;
	@Input('hide-overlay') hideOverlay: boolean;
	@Input('maps') maps: any;
	// @Input('time') time: CaseTimeState;

	@Output('toggleEditMode') toggleEditMode = new EventEmitter();
	@ViewChild('goPrev') goPrev: ElementRef;
	@ViewChild('goNext') goNext: ElementRef;



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

	constructor(public store: Store<IStatusBarState>) {

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

		this.flags$.subscribe(flags => {
			//I want to check that the one that was changing is the pin point search
			if (this.flags.get(statusBarFlagsItems.pinPointSearch) !== flags.get(statusBarFlagsItems.pinPointSearch)) {
				this.toggleEditMode.emit();
			}
			this.flags = new Map(flags) as Map<string, boolean>;
		});

		this.time$.subscribe((_time) => {
			this.time = _time;
		})
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
